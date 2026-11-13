// src/server/proxy/api-proxy.ts
import { Router, type Request, type Response } from 'express';
import { serverConfig } from '@server/config';
import { buildRequestHeaders, forwardHeaders } from '@server/http/proxy-headers';

export const apiProxy = Router();

apiProxy.use(async (req: Request, res: Response) => {
  const targetUrl = `${serverConfig.apiUrl}${req.url}`;

  const headers = buildRequestHeaders(req);
  headers.set('X-API-Key', serverConfig.apiKey);

  const hasBody = !['GET', 'HEAD'].includes(req.method) && req.is('json');

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    res.status(502).json({
      type: 'upstream-unavailable',
      title: 'Upstream Service Unavailable.',
      status: 502,
      detail: 'No se pudo contactar la API.',
    });
    return;
  }

  res.status(upstream.status);
  forwardHeaders(upstream, res);
  res.send(Buffer.from(await upstream.arrayBuffer()));
});
