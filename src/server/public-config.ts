import { Router } from 'express';
import { serverConfig } from '@server/config';

/**
 * Configuración PÚBLICA para el navegador.
 * Solo valores que ya son visibles para cualquier usuario (p. ej. el client_id de
 * Google). NUNCA secretos: este endpoint no exige sesión.
 */
export const publicConfigRouter = Router();

publicConfigRouter.get('/config', (_req, res) => {
  res.json({ googleClientId: serverConfig.googleClientId });
});
