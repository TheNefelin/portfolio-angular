import type { Request, Response } from 'express';
import { serverConfig } from '@server/config';
import { buildRequestHeaders, forwardResponseHeaders } from '@server/http/headers';

const UPSTREAM_TIMEOUT_MS = 15_000;

export interface UpstreamOptions {
  /** Access token a enviar como `Authorization: Bearer`. */
  bearer?: string;
  /** Si se indica, reemplaza el body de la petición (se envía como JSON). */
  json?: unknown;
}

/** URL hacia FastAPI para una ruta fija del BFF (p. ej. '/auth/logout'). */
export function upstreamUrl(path: string): URL {
  return new URL(serverConfig.apiUrl.replace(/\/$/, '') + path);
}

/** Redirect permitido: mismo origin y mismo path salvo la barra final. */
function slashRedirect(from: URL, location: string | null): URL | null {
  if (!location) return null;
  const to = new URL(location, from);
  if (to.origin !== from.origin) return null;
  const strip = (p: string) => p.replace(/\/$/, '');
  return strip(to.pathname) === strip(from.pathname) ? to : null;
}

/** Único fetch hacia FastAPI. Devuelve `null` si no se pudo obtener una respuesta válida. */
export async function fetchUpstream(
  req: Request,
  target: URL,
  options: UpstreamOptions = {},
): Promise<globalThis.Response | null> {
  const headers = buildRequestHeaders(req);
  headers.set('X-API-Key', serverConfig.apiKey);
  if (options.bearer) headers.set('Authorization', `Bearer ${options.bearer}`);

  let body: BodyInit | undefined;
  if (options.json !== undefined) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(options.json);
  } else if (req.method !== 'GET' && req.method !== 'HEAD' && Buffer.isBuffer(req.body) && req.body.length > 0) {
    body = new Uint8Array(req.body);
  }

  const call = (url: URL) =>
    fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

  try {
    let upstream = await call(target);

    if (upstream.status === 307 || upstream.status === 308) {
      const next = slashRedirect(target, upstream.headers.get('location'));
      if (next) upstream = await call(next);
    }

    if (upstream.status >= 300 && upstream.status < 400 && upstream.status !== 304) {
      console.error('[BFF] redirect no permitido:', upstream.status, upstream.headers.get('location'), 'desde', target.href);
      return null;
    }
    return upstream;
  } catch (err) {
    console.error('[BFF] fetch falló:', target.href, err);
    return null;
  }
}

export function sendBadGateway(res: Response): void {
  res.status(502).json({ type: 'upstream-unavailable', title: 'Upstream Service Unavailable.', status: 502 });
}

export async function sendUpstream(res: Response, upstream: globalThis.Response): Promise<void> {
  res.status(upstream.status);
  forwardResponseHeaders(upstream, res);
  res.send(Buffer.from(await upstream.arrayBuffer()));
}
