import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // HOME: SEO y datos por request.
  { path: '', renderMode: RenderMode.Server },
  // Admin: privado, sin SEO. Se renderiza en el navegador.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Resto (auth, forbidden, 404): estático.
  { path: '**', renderMode: RenderMode.Prerender },
];
