import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // HOME: SEO y datos por request.
  { path: '', renderMode: RenderMode.Prerender },
  // Admin: privado, sin SEO. Se renderiza en el navegador.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Cualquier otra URL: renderiza NotFoundPage y responde 404 real.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
