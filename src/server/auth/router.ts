import { Router } from 'express';
import { fetchUpstream, sendBadGateway, sendUpstream, upstreamUrl } from '@server/http/forward';
import { clearSession, readSession, setSession } from '@server/auth/session';

export const authRouter = Router();

// Login: FastAPI devuelve tokens → van a cookies HttpOnly, Angular recibe el resto.
for (const name of ['google', 'login', 'register']) {
  authRouter.post(`/auth/${name}`, async (req, res, next) => {
    try {
      const upstream = await fetchUpstream(req, upstreamUrl(`/auth/${name}`));
      if (!upstream) return sendBadGateway(res);
      if (!upstream.ok) return sendUpstream(res, upstream); // errores del backend: no llevan tokens

      const data = (await upstream.json().catch(() => null)) as Record<string, unknown> | null;
      if (!data || typeof data['access_token'] !== 'string') {
        console.error(`[BFF] /auth/${name}: la respuesta no trae access_token`);
        return sendBadGateway(res);
      }

      setSession(
        req,
        res,
        {
          access_token: data['access_token'],
          refresh_token: typeof data['refresh_token'] === 'string' ? data['refresh_token'] : undefined,
          expires_in: typeof data['expires_in'] === 'number' ? data['expires_in'] : undefined,
        },
        { newCsrf: true },
      );

      const safe = { ...data };
      delete safe['access_token'];
      delete safe['refresh_token'];
      res.status(upstream.status).json(safe);
    } catch (err) {
      next(err);
    }
  });
}

// Logout: avisa al backend (si puede) y borra las cookies SIEMPRE.
authRouter.post('/auth/logout', async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = readSession(req);
    if (accessToken || refreshToken) {
      const upstream = await fetchUpstream(req, upstreamUrl('/auth/logout'), {
        bearer: accessToken,
        json: refreshToken ? { refresh_token: refreshToken } : undefined,
      });
      await upstream?.body?.cancel();
    }
    clearSession(req, res);
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});
