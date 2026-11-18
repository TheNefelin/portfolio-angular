import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // HOME: SEO y datos por request.
  { path: '', renderMode: RenderMode.Prerender },
  // Auth: login público, se renderiza en el servidor.
  { path: 'auth', renderMode: RenderMode.Server },
  { path: 'auth/**', renderMode: RenderMode.Server },
  // Admin: privado, sin SEO. Se renderiza en el navegador.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Forbidden: página de acceso denegado.
  { path: 'forbidden', renderMode: RenderMode.Server },
  // Privacy policy: contenido estático.
  { path: 'privacy-policy', renderMode: RenderMode.Server },
  { path: 'privacy-policy/**', renderMode: RenderMode.Server },
  { path: 'navaja-suiza/privacy-policy', renderMode: RenderMode.Server },
  // Cualquier otra URL: renderiza NotFoundPage y responde 404 real.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
