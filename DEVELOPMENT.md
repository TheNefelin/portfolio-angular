# Desarrollo — portfolio-angular

> Memoria del proyecto: decisiones y estado que deben sobrevivir a cada sesión.
> Marca el **estado** de cada decisión (`Aceptado`, `Propuesto`, `Pendiente`); lo desconocido se anota, no se inventa.
> Reemplaza el estado caducado en vez de acumular un diario de cada sesión.
> Empieza por el **Mapa del proyecto**: apunta a dónde mirar sin re-escanear el código.

## Mapa del proyecto

| Área / tema | Dónde mirar | Cuándo leerlo |
|---|---|---|
| Arranque y providers | `src/main.ts`, `src/app/app.config.ts` | al agregar providers o cambiar el bootstrap |
| Rutas y render | `src/app/app.routes.ts`, `src/app/app.routes.server.ts` | al agregar páginas o cambiar prerender/SSR |
| Layouts | `src/app/layouts/home-layout-component/`, `src/app/layouts/user-layout-component/` | al cambiar el shell público o el admin |
| HOME | `src/app/features/home/` | al migrar o ajustar secciones del HOME |
| CRUD de portfolio | `src/app/features/url-grp/`, `src/app/features/url/` | al implementar URLs y grupos de enlaces |
| Cliente de API | `src/app/core/services/api-service.ts` | al cambiar URL, key, headers o errores |
| Base de listados | `src/app/shared/base/crud-page.ts` | al cambiar paginación, filtro o reload |
| Componentes compartidos | `src/app/shared/components/` | al reutilizar botón, navbar, footer o 404 |
| Modelos compartidos | `src/app/shared/models/` | al cambiar paginación request/response |
| SSR y BFF | `src/server.ts`, `src/app/app.config.server.ts` | al agregar proxy, variables de entorno o auth |
| Estilos y assets | `src/styles.css`, `.postcssrc.json`, `public/images/` | al cambiar Tailwind, DaisyUI o imágenes |
| Build y test | `angular.json`, `package.json`, `tsconfig*.json` | al cambiar configuración, targets o presupuestos |

## Arquitectura

Aplicación Angular 22 standalone con SSR y Tailwind 4 + DaisyUI 5.

- **Bootstrap:** `src/main.ts` arranca la app; `src/app/app.config.server.ts` configura el render servidor.
- **Servidor:** `src/server.ts` usa `@angular/ssr/node` con Express y sirve `dist/portfolio-angular/browser`.
- **Rutas:** `/` monta `HomeLayoutComponent` + `HomePage`; `/admin` monta `UserLayoutComponent`; `**` va a `NotFoundPage`.
- **HOME:** migrado parcialmente desde `portfolio-astro/`. Están `Hero`, `Title`, `Console`, `Code`, `Certification` y `Social`; faltan `Card` (proyectos) y el footer con datos de la API.
- **Admin:** `UserLayoutComponent` es un placeholder de DaisyUI (navbar/footer duplicados y “Page Content”); no hay dashboard ni rutas hijas.
- **CRUD:** `url` y `url-grp` tienen modelos, services y páginas, pero son scaffolds: muestran `JsonPipe`, `reload()` lanza excepción y las rutas no están conectadas.
- **API:** `ApiService` llama directo a una URL de producción y lleva la API key en el código del cliente. No hay BFF ni `provideHttpClient()` visible en `app.config.ts`.
- **Render:** `app.routes.server.ts` usa `RenderMode.Prerender` para `**`; el build prerenderiza 2 rutas, incluida `/admin`.

## Decisiones técnicas

| Fecha | Estado | Decisión | Motivo | Alternativas descartadas |
|---|---|---|---|---|
| 2026-10-27 | Aceptado | Angular 22 standalone con SSR (`@angular/ssr/node` + Express). | Permite SEO y mantiene un solo despliegue. | SPA sin SSR. |
| 2026-10-27 | Aceptado | Tailwind 4 + DaisyUI 5. | Reutiliza los estilos del HOME de Astro y del admin de referencia. | CSS artesanal o Angular Material. |
| 2026-10-28 | Aceptado | `portfolio-angular` será la app única: HOME público + admin de portfolio. | Elimina la duplicación entre Astro y el admin. | Mantener Astro + admin separados. |
| 2026-10-28 | Aceptado | El HOME se migra primero desde `portfolio-astro/`. | Es la parte visible y define rutas, estilos y consumo de la API. | Empezar por el admin. |
| 2026-10-28 | Aceptado | Del admin solo se migra `admin-app-angular/src/app/features/portfolio/` y lo compartido necesario. | Game Guides es un producto aparte y no tiene relación con este portfolio. | Migrar el admin completo. |
| 2026-10-28 | Pendiente | Acceso a la API: BFF server-side o SSR con key. | La API key no puede quedar en el bundle del navegador. | Servicio cliente con key hardcodeada (descartado). |
| 2026-10-28 | Pendiente | Login del admin de portfolio. | El admin de referencia tiene auth por namespace, pero `portfolio` no lo tiene activo. | Admin sin login. |
| 2026-10-28 | Pendiente | Modo de render por ruta. | `/` puede ser Server/Prerender; `/admin/**` no debería prerenderizarse. | Prerender de `**` (estado actual). |

## Estado

- Build `pnpm build`: **OK** (2 rutas prerenderizadas, 2026-10-28).
- Tests `pnpm test --watch=false`: **23/23 pasan** (2026-10-28).
- HOME parcial: secciones estáticas migradas; faltan proyectos y footer con datos.
- `url` y `url-grp`: scaffolds sin CRUD funcional ni rutas.
- Admin: solo placeholder; sin dashboard, auth ni migración de `features/portfolio/`.
- **Siguiente paso:** cerrar el HOME (Card + footer + anclas) y definir el BFF antes de conectar datos reales.

## Pendientes

- Agregar `Card` de proyectos y pasar `urlGrpDetailList` al footer desde la API.
- Corregir el `id` de `TitleComponent` para que funcionen las anclas del navbar.
- Configurar `provideHttpClient()` y mover URL/key de la API fuera del cliente.
- Implementar `reload()` y las rutas de `url`/`url-grp`; luego language, technology y project.
- Implementar el dashboard admin y decidir el login de portfolio.
- Cambiar el render de `/admin/**` a Client/Server y definir el de `/`.
- Quitar `JsonPipe` y `console.log` de las páginas/scaffolds.
- Agregar script de lint y formateo.

## Problemas conocidos

- **Seguridad:** `src/app/core/services/api-service.ts` tiene la API key hardcodeada y la envía desde el navegador. Si esa key fue publicada, hay que rotarla. No debe quedar en el bundle.
- `ApiService` usa `console.log(endpoint)` y un header `X-API-key`; conviene unificar `X-API-Key`.
- No veo `provideHttpClient()` en `app.config.ts`; el service se instancia en tests, pero falta confirmar una llamada HTTP real en runtime.
- `TitleComponent` usa `id={id}` pero no declara un input `id`; las anclas `#id_Experience`, `#id_projects`, etc. no apuntan a nada.
- `HomeLayoutComponent` no pasa datos al `FooterComponent`; el footer se renderiza vacío.
- `HomePage` no incluye el componente de proyectos (`Card`); esa sección del HOME de Astro falta.
- `UrlGrpListPage.reload()` y `UrlListPage.reload()` lanzan `throw new Error('Method not implemented.')`; además las páginas no están enlazadas en `app.routes.ts`.
- `UrlGrpService.getAllPagination` arma `pagination/?page=...`; conviene confirmar que la API no redirija o fallar por la barra extra.
- `app.routes.server.ts` prerenderiza `/admin`; no es deseable para una pantalla con auth o datos privados.
- `UserLayoutComponent` es un demo de DaisyUI con navbar/footer duplicados y contenido de ejemplo; no es el admin real.
- `FooterComponent` (shared) importa `UrlGrpDetailModel` desde una feature; es una dependencia invertida.
- `ConsoleComponent` usa `setTimeout` recursivo sin limpieza completa y tiene un `#scrollAnchor` sin uso; el auto-scroll no está implementado.
- El navbar usa `href` y no `routerLink`; las anclas y el logo pueden recargar o perder el estado del router.

## Deuda técnica

- Mover modelos compartidos fuera de las features para romper dependencias invertidas.
- Portar el patrón de errores/toasts/confirmación del admin (`ErrorService`, `SuccessService`, `ConfirmService`, `MutationService`) cuando se migre el CRUD.
- Portar el BFF `/ssr-api/{namespace}` de `admin-app-angular/src/server.ts` y su manejo de uploads.
- Agregar tests de servicios, rutas y componentes con datos; los specs actuales solo comprueban creación.
- Agregar lint (ESLint) y un script de formato como en el admin de referencia.
