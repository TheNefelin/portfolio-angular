// src/server/http/proxy-headers.ts
import type { Request, Response } from 'express';

/** Cabeceras que un proxy NO reenvía, en ninguna dirección. */
export const SKIP_HEADERS = new Set([
  // hop-by-hop (válidas solo para una conexión, no extremo a extremo)
  'host',
  'connection',
  'keep-alive',
  'upgrade',
  'te',
  'trailer',
  'transfer-encoding',
  'proxy-authenticate',
  'proxy-authorization',
  // el body se recalcula/descomprime en el BFF
  'content-length',
  'content-encoding',
  // sesión: la gestiona el BFF, no se filtra a la API ni al navegador
  'set-cookie',
  'cookie',
  'x-csrf-token',
]);

/** Cabeceras de la petición del navegador que se reenvían a la API. */
export function buildRequestHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || SKIP_HEADERS.has(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  return headers;
}

/** Copia las cabeceras de la respuesta de la API al navegador. */
export function forwardHeaders(upstream: globalThis.Response, res: Response): void {
  upstream.headers.forEach((value, key) => {
    if (!SKIP_HEADERS.has(key.toLowerCase())) res.setHeader(key, value);
  });
}
