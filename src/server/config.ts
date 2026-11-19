/**
 * Configuración del servidor Express (SSR/BFF).
 *
 * Vive SOLO en el servidor: nunca se incluye en el bundle del cliente.
 * Responsabilidad ÚNICA: leer y validar `process.env`. Sin I/O ni efectos:
 * la carga del `.env` corresponde a `env.ts`, que debe importarse antes.
 *
 * La seguridad viene de que estos valores NO llegan al navegador.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno del servidor: ${name}.`);
  return value;
}

export const serverConfig = {
  get apiUrl() { return required('API_URL'); },
  get apiKey() { return required('API_KEY'); },
  get googleClientId() { return required('GOOGLE_CLIENT_ID'); },
};