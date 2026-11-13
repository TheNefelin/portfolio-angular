export default async function handler(req, res) {
  const apiUrl = (process.env.API_URL ?? '').replace(/\/+$/, '');
  const apiKey = process.env.API_KEY;

  if (!apiUrl || !apiKey) {
    res.status(500).json({ detail: 'Falta configurar API_URL y API_KEY en Vercel' });
    return;
  }

  // Vercel passes the catch-all path as req.query.path (array of segments)
  const segments = req.query.path;
  const path = Array.isArray(segments) ? '/' + segments.join('/') : `/${segments}`;

  // Reenviar los query params reales (page, limit, ...). Sin esto el backend
  // recibe la peticion sin paginacion y puede devolver una respuesta inesperada.
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (key === 'path') continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else if (value !== undefined) {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  const targetUrl = `${apiUrl}${path}${qs ? '?' + qs : ''}`;

  const outgoingBody =
    req.method !== 'GET' && req.method !== 'HEAD'
      ? typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body ?? {})
      : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
      },
      body: outgoingBody,
      signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();

    // Igual que el BFF local: si el backend no devuelve JSON valido, se
    // envuelve como { detail } para que el cliente siempre pueda parsear.
    let body = text;
    if (text) {
      try {
        JSON.parse(text);
      } catch {
        body = JSON.stringify({ detail: text });
      }
    } else {
      body = '';
    }

    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(body);
  } catch (err) {
    console.error('[proxy] error:', err);
    res.status(502).json({ detail: 'Error de conexion con la API.' });
  }
}
