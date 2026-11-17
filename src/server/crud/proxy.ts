import { Router } from 'express';
import { serverConfig } from '@server/config';
import { forward } from '@server/http/forward';

export const crudProxy = Router();

/**
 * Allowlist: recurso → métodos permitidos. Todo lo que no esté aquí → 404.
 * TODO: restringir métodos por recurso según lo que Angular realmente usa.
 */
const ALL = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const RESOURCES: Record<string, readonly string[]> = {
  language: ALL,
  project: ALL,
  technology: ALL,
  url: ALL,
  'url-grp': ALL,
};

/** Resuelve la URL destino, o `null` si sale del upstream o no está permitida. */
function resolveTarget(reqUrl: string): { target: URL; resource: string } | null {
  if (!reqUrl.startsWith('/') || /%2f|%5c|\\/i.test(reqUrl)) return null;

  const base = new URL(serverConfig.apiUrl);
  const basePath = base.pathname.replace(/\/$/, '');
  const target = new URL(basePath + reqUrl, base.origin);

  // `new URL` ya normalizó `..` y `%2e%2e`: se valida DESPUÉS de normalizar.
  if (target.origin !== base.origin) return null;
  if (!target.pathname.startsWith(basePath + '/')) return null;

  const resource = target.pathname.slice(basePath.length + 1).split('/')[0];
  if (!Object.hasOwn(RESOURCES, resource)) return null;

  return { target, resource };
}

crudProxy.use(async (req, res, next) => {
  try {
    const resolved = resolveTarget(req.url);
    if (!resolved) {
      res.status(404).json({ type: 'not-found', title: 'Not Found.', status: 404 });
      return;
    }

    const method = req.method === 'HEAD' ? 'GET' : req.method;
    const allowed = RESOURCES[resolved.resource];
    if (!allowed.includes(method)) {
      res.setHeader('Allow', allowed.join(', '));
      res.status(405).json({ type: 'method-not-allowed', title: 'Method Not Allowed.', status: 405 });
      return;
    }

    await forward(req, res, resolved.target);
  } catch (err) {
    next(err);
  }
});
