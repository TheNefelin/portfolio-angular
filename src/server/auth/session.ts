import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { serverConfig } from '@server/config';
import { buildSetCookie, parseCookies } from '@server/http/cookies';

const ACCESS_TTL_DEFAULT_SEC = 900;
const REFRESH_TTL_SEC = 60 * 60 * 24;
const REFRESH_TIMEOUT_MS = 5_000;
const REFRESH_CACHE_MS = 10_000;

export interface Tokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export type RefreshResult =
  | { status: 'ok'; tokens: Tokens }
  | { status: 'rejected' }     // el backend rechazó el refresh: la sesión ya no vale
  | { status: 'unavailable' }; // red, timeout o 5xx: NO cerrar la sesión

function isSecure(req: Request): boolean {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

function positive(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function readSession(req: Request): { accessToken?: string; refreshToken?: string } {
  const c = parseCookies(req.headers.cookie);
  return { accessToken: c['access_token'], refreshToken: c['refresh_token'] };
}

export function setSession(
  req: Request,
  res: Response,
  tokens: Tokens,
  options: { newCsrf?: boolean } = {},
): void {
  const secure = isSecure(req);
  const cookies = parseCookies(req.headers.cookie);

  res.append('Set-Cookie', buildSetCookie('access_token', tokens.access_token, positive(tokens.expires_in, ACCESS_TTL_DEFAULT_SEC), { httpOnly: true, secure }));
  if (tokens.refresh_token) {
    res.append('Set-Cookie', buildSetCookie('refresh_token', tokens.refresh_token, REFRESH_TTL_SEC, { httpOnly: true, secure }));
  }
  // El token CSRF dura lo que la sesión larga; solo cambia en un login nuevo.
  if (options.newCsrf || !cookies['csrf_token']) {
    res.append('Set-Cookie', buildSetCookie('csrf_token', randomUUID(), REFRESH_TTL_SEC, { httpOnly: false, secure }));
  }
}

export function clearSession(req: Request, res: Response): void {
  const secure = isSecure(req);
  res.append('Set-Cookie', buildSetCookie('access_token', '', 0, { httpOnly: true, secure }));
  res.append('Set-Cookie', buildSetCookie('refresh_token', '', 0, { httpOnly: true, secure }));
  res.append('Set-Cookie', buildSetCookie('csrf_token', '', 0, { httpOnly: false, secure }));
}

async function doRefresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${serverConfig.apiUrl.replace(/\/$/, '')}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': serverConfig.apiKey },
      body: JSON.stringify({ refresh_token: refreshToken }),
      redirect: 'manual',
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });

    if (res.status === 400 || res.status === 401 || res.status === 403) return { status: 'rejected' };
    if (!res.ok) return { status: 'unavailable' };

    const data = (await res.json()) as Record<string, unknown>;
    if (typeof data['access_token'] !== 'string') return { status: 'unavailable' };

    return {
      status: 'ok',
      tokens: {
        access_token: data['access_token'],
        refresh_token: typeof data['refresh_token'] === 'string' ? data['refresh_token'] : undefined,
        expires_in: typeof data['expires_in'] === 'number' ? data['expires_in'] : undefined,
      },
    };
  } catch {
    return { status: 'unavailable' };
  }
}

// Una sola llamada por refresh token: las peticiones simultáneas comparten el resultado.
const inflight = new Map<string, Promise<RefreshResult>>();

export function refreshSession(refreshToken: string): Promise<RefreshResult> {
  let promise = inflight.get(refreshToken);
  if (!promise) {
    promise = doRefresh(refreshToken);
    inflight.set(refreshToken, promise);
    // Se conserva unos segundos por si llega una petición rezagada con la cookie vieja.
    setTimeout(() => inflight.delete(refreshToken), REFRESH_CACHE_MS).unref();
    // Un fallo transitorio no se cachea: el siguiente intento puede ir bien.
    void promise.then((r) => {
      if (r.status === 'unavailable') inflight.delete(refreshToken);
    });
  }
  return promise;
}
