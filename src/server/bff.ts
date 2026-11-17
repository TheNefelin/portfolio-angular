import express, { Router, type ErrorRequestHandler } from 'express';
import { crudProxy } from '@server/crud/proxy';

/** Router único del BFF. server.ts solo lo monta bajo el prefijo. */
export const bff = Router();

// 1. Ninguna respuesta del BFF se cachea (navegador ni CDN).
bff.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// 2. Body sin parsear (Buffer): se reenvía tal cual, sea del tipo que sea.
bff.use(express.raw({ type: () => true, limit: '5mb' }));

// 3. Paso 1 (AUTH): aquí se montará el router de auth, ANTES del CRUD.

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
