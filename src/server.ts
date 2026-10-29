import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  // Angular rechaza los Host que no estén en esta lista (protección SSRF).
  // En producción, definir NG_ALLOWED_HOSTS con el dominio real.
  allowedHosts: (process.env['NG_ALLOWED_HOSTS'] ?? 'localhost,127.0.0.1')
    .split(',')
    .map((host) => host.trim())
    .filter((host) => host.length > 0),
});

// Carga .env si existe. Las variables ya definidas en el entorno tienen prioridad.
try {
  process.loadEnvFile();
} catch {
  // Sin archivo .env: se usan las variables del proceso.
}

const API_URL = (process.env['API_URL'] ?? '').replace(/\/+$/, '');
const API_KEY = process.env['API_KEY'] ?? '';

const PROXY_PREFIX = '/ssr-api';
const PROXY_TIMEOUT_MS = 15_000;
const PROXY_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

app.use(express.json());

// BFF: el navegador llama a /ssr-api/{ruta} y el servidor agrega la API key.
// La key nunca sale del proceso del servidor.
app.use(PROXY_PREFIX, async (req, res) => {
  if (!PROXY_METHODS.has(req.method)) {
    res.status(405).json({ detail: `Método no permitido: ${req.method}` });
    return;
  }

  if (!API_URL || !API_KEY) {
    res.status(500).json({ detail: 'Falta configurar API_URL y API_KEY en el servidor.' });
    return;
  }

  const sendsBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';

  try {
    const response = await fetch(`${API_URL}${req.url}`, {
      method: req.method,
      headers: {
        'X-API-Key': API_KEY,
        Accept: 'application/json',
        ...(sendsBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: sendsBody ? JSON.stringify(req.body ?? {}) : undefined,
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });

    const text = await response.text();

    if (!text) {
      res.status(response.status).end();
      return;
    }

    res.status(response.status).json(parseJsonSafe(text));
  } catch (err) {
    console.error('[server.ts] proxy error:', err);
    res.status(502).json({ detail: 'Error de conexión con la API.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
