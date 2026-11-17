import type { Request, Response } from 'express';

/** De la petición del navegador solo viaja esto hacia FastAPI. */
const REQUEST_HEADERS = [
  'accept', 'accept-language', 'content-type', 'if-none-match', 'if-modified-since',
];

/** De la respuesta de FastAPI NO se reenvía esto al navegador. */
const RESPONSE_SKIP = new Set([
  'connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'te', 'trailer',
  'proxy-authenticate', 'proxy-authorization',
  'content-length', 'content-encoding',
  'set-cookie', 'location', 'server', 'x-powered-by',
]);

export function buildRequestHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = req.headers[name];
    if (typeof value === 'string') headers.set(name, value);
  }
  return headers;
}

export function forwardResponseHeaders(upstream: globalThis.Response, res: Response): void {
  upstream.headers.forEach((value, key) => {
    if (!RESPONSE_SKIP.has(key.toLowerCase())) res.setHeader(key, value);
  });
}
