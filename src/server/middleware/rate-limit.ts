/**
 * Rate limiting del BFF: contador en memoria, SIN dependencias.
 *
 * LIMITACIÓN IMPORTANTE (serverless / varias instancias):
 * los contadores viven en la memoria del proceso. En Vercel cada petición puede
 * caer en una instancia distinta, que además se crea y se destruye sola, y cada
 * una cuenta por su cuenta. El límite real es, por tanto, MÁS ALTO que el
 * configurado y puede reiniciarse en cualquier momento. Aquí se considera una
 * red de seguridad barata, NO la defensa principal.
 *
 * Capas, de más a menos fiable:
 *   1. Vercel Firewall (rate limit de la plataforma): la defensa real.
 *   2. Este archivo: instancia única (dev, VPS, Docker) y respaldo en Vercel.
 *   3. Rate limit en FastAPI: protege la API aunque se salten el BFF.
 *
 * Si algún día se necesita un límite exacto entre instancias, hay que mover el
 * contador a un almacén compartido (p. ej. Redis/Upstash) manteniendo esta misma
 * interfaz.
 *
 * Grupos (cada petición cuenta en UNO solo, así que las cuotas son independientes):
 *   read   GET/HEAD, incluido GET /auth/me
 *   write  POST/PUT/PATCH/DELETE fuera de /auth
 *   auth   POST/PUT/PATCH/DELETE bajo /auth/* (login, register, google, logout)
 */

import type { Request, RequestHandler } from 'express';

interface RateLimitOptions {
  /** Nombre del limitador, para los logs. */
  name: string;
  windowMs: number;
  /** Peticiones permitidas por clave dentro de la ventana. */
  max: number;
  /** Devuelve true para no contar ni limitar esa petición. */
  skip?: (req: Request) => boolean;
}

interface Entry {
  count: number;
  resetAt: number;
}

/** Tope de claves en memoria: evita que un atacante con muchas IPs agote la RAM. */
const MAX_KEYS = 10_000;

/**
 * IP del cliente. Solo es fiable detrás de un proxy que sobrescribe
 * `x-forwarded-for` (Vercel lo hace). Fuera de un proxy de confianza, el cliente
 * podría falsearla y saltarse el límite.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  return first || req.socket.remoteAddress || 'unknown';
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
  const hits = new Map<string, Entry>();
  let lastSweep = Date.now();

  // Limpieza perezosa (sin timers, que en serverless no son fiables).
  function sweep(now: number): void {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
    // Si sigue lleno, descarta las más antiguas (el Map conserva el orden de inserción).
    for (const key of hits.keys()) {
      if (hits.size <= MAX_KEYS) break;
      hits.delete(key);
    }
    lastSweep = now;
  }

  return (req, res, next) => {
    if (options.skip?.(req)) return next();

    const now = Date.now();
    if (now - lastSweep > options.windowMs || hits.size > MAX_KEYS) sweep(now);

    const key = clientIp(req);
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + options.windowMs };
      hits.set(key, entry);
    }
    entry.count++;

    if (entry.count > options.max) {
      // Un solo aviso por IP y ventana: un ataque no debe llenar los logs.
      if (entry.count === options.max + 1) {
        console.warn(`[BFF] rate limit "${options.name}" superado por ${key}`);
      }
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({ type: 'too-many-requests', title: 'Too Many Requests.', status: 429 });
      return;
    }
    next();
  };
}

/** Lee un entero positivo de una variable de entorno; si falta o es inválido, usa el valor por defecto. */
function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * Valores configurables por entorno (todos opcionales):
 *   RATE_LIMIT_WINDOW_SEC   ventana en segundos                              (por defecto 60)
 *   RATE_LIMIT_READ_MAX     todos los GET/HEAD, incluido GET /auth/me        (por defecto 100)
 *   RATE_LIMIT_WRITE_MAX    POST/PUT/PATCH/DELETE fuera de /auth             (por defecto 25)
 *   RATE_LIMIT_AUTH_MAX     POST/PUT/PATCH/DELETE bajo /auth/*               (por defecto 5)
 *
 * Se leen una sola vez, al arrancar: cambiarlos exige reiniciar o volver a desplegar.
 */
const windowMs = envInt('RATE_LIMIT_WINDOW_SEC', 60) * 1000;

const isRead = (req: Request) => req.method === 'GET' || req.method === 'HEAD';
const isAuth = (req: Request) => req.path === '/auth' || req.path.startsWith('/auth/');

/** Todas las lecturas, también las de /auth (p. ej. GET /auth/me). */
export const readLimiter = rateLimit({
  name: 'read',
  windowMs,
  max: envInt('RATE_LIMIT_READ_MAX', 100),
  skip: (req) => !isRead(req),
});

/** Escrituras del CRUD. Las lecturas, el preflight (OPTIONS) y auth quedan fuera. */
export const writeLimiter = rateLimit({
  name: 'write',
  windowMs,
  max: envInt('RATE_LIMIT_WRITE_MAX', 25),
  skip: (req) => isRead(req) || req.method === 'OPTIONS' || isAuth(req),
});

/** Login, register, google, logout y cualquier otra escritura de /auth: el más estricto. */
export const authLimiter = rateLimit({
  name: 'auth',
  windowMs,
  max: envInt('RATE_LIMIT_AUTH_MAX', 5),
  skip: (req) => isRead(req) || req.method === 'OPTIONS' || !isAuth(req),
});
