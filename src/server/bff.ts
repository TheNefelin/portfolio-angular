import express, { Router, type ErrorRequestHandler } from 'express';
import { crudProxy } from '@server/crud/proxy';
import { authRouter } from '@server/auth/router';
import { csrfGuard } from '@server/auth/csrf';
import { authLimiter, readLimiter, writeLimiter } from '@server/middleware/rate-limit';

/** Router único del BFF. server.ts solo lo monta bajo el prefijo. */
export const bff = Router();

// 1. Ninguna respuesta del BFF se cachea (navegador ni CDN).
bff.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// 1b. Rate limiting (ver las limitaciones en middleware/rate-limit.ts).
bff.use(readLimiter);
bff.use(writeLimiter);
bff.use(authLimiter);

// 2. Body sin parsear (Buffer): se reenvía tal cual, sea del tipo que sea.
bff.use(express.raw({ type: () => true, limit: '5mb' }));

// 3. CSRF y AUTH, siempre ANTES del CRUD.
bff.use(csrfGuard);
bff.use(authRouter);

// 4. CRUD genérico.
bff.use(crudProxy);

// 5. Errores del BFF (413, bugs) → siempre JSON, nunca HTML.
const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status =
    Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('[BFF]', err);
  res.status(status).json({
    type: status === 413 ? 'payload-too-large' : 'bff-error',
    title: status === 413 ? 'Payload Too Large.' : 'BFF Error.',
    status,
  });
};
bff.use(errorHandler);
