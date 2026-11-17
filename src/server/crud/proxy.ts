import { Router } from 'express';
import { serverConfig } from '@server/config';
import { fetchUpstream, sendBadGateway, sendUpstream } from '@server/http/forward';
import { clearSession, readSession, refreshSession, setSession } from '@server/auth/session';

export const crudProxy = Router();

const ALL = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

/** Allowlist: recurso (o recurso/subruta) → métodos permitidos. Todo lo demás → 404. */
const RESOURCES: Record<string, readonly string[]> = {
  language: ALL,
  project: ALL,
  technology: ALL,
  url: ALL,
  'url-grp': ALL,
  'auth/me': ['GET'],
};

function resolveTarget(reqUrl: string): { target: URL; key: string } | null {
  if (!reqUrl.startsWith('/') || /%2f|%5c|\\/i.test(reqUrl)) return null;

  const base = new URL(serverConfig.apiUrl);
  const basePath = base.pathname.replace(/\/$/, '');
  const target = new URL(basePath + reqUrl, base.origin);

  // `new URL` ya normalizó `..` y `%2e%2e`: se valida DESPUÉS de normalizar.
  if (target.origin !== base.origin) return null;
  if (!target.pathname.startsWith(basePath + '/')) return null;

  const [first, second = ''] = target.pathname.slice(basePath.length + 1).split('/');
  const key = Object.hasOwn(RESOURCES, `${first}/${second}`) ? `${first}/${second}` : first;
  if (!Object.hasOwn(RESOURCES, key)) return null;

  return { target, key };
}

crudProxy.use(async (req, res, next) => {
  try {
    const resolved = resolveTarget(req.url);
    if (!resolved) {
      res.status(404).json({ type: 'not-found', title: 'Not Found.', status: 404 });
      return;
    }

    const method = req.method === 'HEAD' ? 'GET' : req.method;
    const allowed = RESOURCES[resolved.key];
    if (!allowed.includes(method)) {
      res.setHeader('Allow', allowed.join(', '));
      res.status(405).json({ type: 'method-not-allowed', title: 'Method Not Allowed.', status: 405 });
      return;
    }

    const { accessToken, refreshToken } = readSession(req);
    let upstream = await fetchUpstream(req, resolved.target, { bearer: accessToken });
    if (!upstream) return sendBadGateway(res);

    // Sesión vencida: renovar y reintentar una sola vez.
    if (upstream.status === 401 && refreshToken) {
      const result = await refreshSession(refreshToken);
      if (result.status === 'ok') {
        setSession(req, res, result.tokens);
        await upstream.body?.cancel();
        upstream = await fetchUpstream(req, resolved.target, { bearer: result.tokens.access_token });
        if (!upstream) return sendBadGateway(res);
      } else if (result.status === 'rejected') {
        clearSession(req, res);
      }
      // 'unavailable': se deja la sesión como está y se devuelve el 401.
    }

    await sendUpstream(res, upstream);
  } catch (err) {
    next(err);
  }
});
