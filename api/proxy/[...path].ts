export default async function handler(req, res) {
  const apiUrl = process.env.API_URL;
  const apiKey = process.env.API_KEY;

  if (!apiUrl || !apiKey) {
    res.status(500).json({ detail: 'Falta configurar API_URL y API_KEY en Vercel' });
    return;
  }

  // Vercel passes the catch-all path as req.query.path (array of segments)
  const segments = req.query.path;
  const path = Array.isArray(segments) ? '/' + segments.join('/') : `/${segments}`;
  const targetUrl = `${apiUrl}${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch (err) {
    console.error('[proxy] error:', err);
    res.status(502).json({ detail: 'Error de conexión con la API.' });
  }
}
