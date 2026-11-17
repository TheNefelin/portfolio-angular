import type { Request, Response } from 'express';
import { serverConfig } from '@server/config';
import { buildRequestHeaders, forwardResponseHeaders } from '@server/http/headers';

const UPSTREAM_TIMEOUT_MS = 15_000;

function sendError(res: Response, status: number, type: string, title: string): void {
  res.status(status).json({ type, title, status });
}

/** Redirect permitido: mismo origin y mismo path salvo la barra final. */
function slashRedirect(from: URL, location: string | null): URL | null {
  if (!location) return null;
  const to = new URL(location, from);
  if (to.origin !== from.origin) return null;
  const strip = (p: string) => p.replace(/\/$/, '');
  return strip(to.pathname) === strip(from.pathname) ? to : null;
}

/** Único punto de salida hacia FastAPI. `target` ya viene validado. */
export async function forward(req: Request, res: Response, target: URL): Promise<void> {
  const headers = buildRequestHeaders(req);
  headers.set('X-API-Key', serverConfig.apiKey);

  const hasBody =
    req.method !== 'GET' && req.method !== 'HEAD' &&
    Buffer.isBuffer(req.body) && req.body.length > 0;
  const body = hasBody ? new Uint8Array(req.body) : undefined;

  const call = (url: URL) =>
    fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

  let upstream: globalThis.Response;
  try {
    upstream = await call(target);

    if (upstream.status === 307 || upstream.status === 308) {
      const next = slashRedirect(target, upstream.headers.get('location'));
      if (next) upstream = await call(next);
    }
  } catch (err) {
    console.error('[BFF] fetch falló:', target.href, err);
    sendError(res, 502, 'upstream-unavailable', 'Upstream Service Unavailable.');
    return;
  }

  if (upstream.status >= 300 && upstream.status < 400 && upstream.status !== 304) {
    console.error('[BFF] redirect no permitido:', upstream.status, upstream.headers.get('location'), 'desde', target.href);
    sendError(res, 502, 'upstream-redirect', 'Unexpected upstream redirect.');
    return;
  }

  res.status(upstream.status);
  forwardResponseHeaders(upstream, res);
  res.send(Buffer.from(await upstream.arrayBuffer()));
}
