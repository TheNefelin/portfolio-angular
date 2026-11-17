import type { RequestHandler } from 'express';
import { parseCookies } from '@server/http/cookies';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function fail(res: Parameters<RequestHandler>[1]): void {
  res.status(403).json({ type: 'csrf-failed', title: 'CSRF validation failed.', status: 403 });
}

export const csrfGuard: RequestHandler = (req, res, next) => {
  if (!MUTATING.has(req.method)) return next();

  const cookies = parseCookies(req.headers.cookie);
  if (!cookies['access_token'] && !cookies['refresh_token']) return next();

  // 1. El origen de la petición debe ser este mismo sitio.
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return fail(res);
    } catch {
      return fail(res);
    }
  }

  // 2. La cabecera debe coincidir con la cookie (doble envío).
  const header = req.headers['x-csrf-token'];
  if (typeof header !== 'string' || !cookies['csrf_token'] || header !== cookies['csrf_token']) {
    return fail(res);
  }
  next();
};
