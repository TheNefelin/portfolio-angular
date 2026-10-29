# Desarrollo — portfolio-angular

> Memoria del proyecto: decisiones y estado que deben sobrevivir a cada sesión.
> Marca el **estado** de cada decisión (`Aceptado`, `Propuesto`, `Pendiente`); lo desconocido se anota, no se inventa.
> Reemplaza el estado caducado en vez de acumular un diario de cada sesión.
> Empieza por el **Mapa del proyecto**: apunta a dónde mirar sin re-escanear el código.

## Mapa del proyecto

| Área / tema | Dónde mirar | Cuándo leerlo |
|---|---|---|
| Arranque y providers | `src/main.ts`, `src/app/app.config.ts` | al agregar providers o cambiar el bootstrap |
| Rutas raíz | `src/app/app.routes.ts` | al agregar una feature o cambiar el layout |
| Rutas por feature | `src/app/features/*/*.routes.ts` | al agregar páginas dentro de una feature |
| Render por ruta | `src/app/app.routes.server.ts` | al cambiar prerender/SSR |
| Layouts | `src/app/layouts/home-layout-component/`, `src/app/layouts/user-layout-component/` | al cambiar el shell público o el admin |
| HOME | `src/app/features/home/` | al ajustar las secciones del HOME |
| Admin | `src/app/features/dashboard/` | al cambiar el dashboard |
| CRUD | `src/app/features/{url-grp,url,language,technology,project}/` | al implementar o ajustar entidades |
| Auth | `src/app/features/auth/` | al tocar el login con Google |
| Cliente de API | `src/app/core/services/api-service.ts` | al cambiar rutas, métodos o errores |
| BFF / proxy | `src/server.ts` | al tocar `/ssr-api`, variables de entorno o el servidor |
| Interceptores y feedback | `src/app/core/interceptors/`, `src/app/core/services/{error,success,confirm,mutation}-service.ts` | al cambiar el manejo de errores o toasts |
| Base de listados | `src/app/shared/base/crud-page.ts` | al cambiar paginación, filtro o reload |
| Constantes de navegación | `src/app/shared/constants/routes-constant.ts` | al agregar una ruta o un ítem del menú |
| Componentes compartidos | `src/app/shared/components/` | al reutilizar botón, navbar, footer, paginación o carga |
| SSR y variables | `src/server.ts`, `.env.demo`, `tsconfig.json` | al cambiar entorno, alias o render servidor |
| Build y test | `angular.json`, `package.json`, `tsconfig*.json` | al cambiar configuración, targets o presupuestos |

## Arquitectura

Aplicación Angular 22 standalone con SSR, Tailwind 4 + DaisyUI 5 y rutas lazy por feature.

- **Bootstrap:** `src/main.ts` arranca la app; `src/app/app.config.ts` registra router, hidratación y `provideHttpClient(withInterceptors([errorInterceptor]))`.
- **Servidor:** `src/server.ts` monta Express, el BFF `/ssr-api` y `AngularNodeAppEngine`.
- **Rutas:** `/` → `HomeLayoutComponent` (HOME y `/auth`); `/admin` → `UserLayoutComponent` con dashboard, `url-grp`, `url`, `language`, `technology` y `project`; `/forbidden` y `**` → páginas de error.
- **HOME:** Hero, Title, Social, Certification, Console, Code y `ProjectCardList` con datos de la API. El footer recibe `urlGrpDetail` desde `HomeLayoutComponent`.
- **Admin:** dashboard propio y un listado por entidad. `url-grp` y `url` tienen CRUD; language, technology y project tienen listado y modelos.
- **API:** `ApiService` llama a `/ssr-api/{ruta}` sin credenciales. El servidor agrega la `X-API-Key` y reenvía el status y el JSON.
- **Errores:** `errorInterceptor` normaliza el `detail` de FastAPI y lo publica en `ErrorService`; el layout lo muestra con los componentes de mensaje/modal.
- **Alias:** `@core/*`, `@features/*`, `@layouts/*` y `@shared/*` viven en `tsconfig.json`, así los usan app y tests.
- **Render:** `app.routes.server.ts` prerenderiza `**` (9 rutas). Las páginas que piden datos durante el prerender quedan con listas vacías en el HTML estático.

## Decisiones técnicas

| Fecha | Estado | Decisión | Motivo | Alternativas descartadas |
|---|---|---|---|---|
| 2026-10-27 | Aceptado | Angular 22 standalone con SSR (`@angular/ssr/node` + Express). | SEO y un solo despliegue. | SPA sin SSR. |
| 2026-10-27 | Aceptado | Tailwind 4 + DaisyUI 5. | Reutiliza los estilos del HOME de Astro y del admin de referencia. | CSS artesanal o Angular Material. |
| 2026-10-28 | Aceptado | `portfolio-angular` será la app única: HOME público + admin de portfolio. | Elimina la duplicación entre Astro y el admin. | Mantener Astro + admin separados. |
| 2026-10-28 | Aceptado | Del admin solo se migra `admin-app-angular/src/app/features/portfolio/` y lo compartido necesario. | Game Guides es un producto aparte. | Migrar el admin completo. |
| 2026-10-29 | Aceptado | BFF `/ssr-api/{ruta}` sin namespace. | Solo hay una API; evita un mapa de namespaces sin uso. La key no entra al bundle. | Namespace `/ssr-api/portfolio/...`; key en el cliente (descartado). |
| 2026-10-29 | Aceptado | Entorno con `process.loadEnvFile()` (Node ≥ 22). | Cero dependencias; las variables del proceso tienen prioridad. | Instalar `dotenv` como en el admin. |
| 2026-10-29 | Aceptado | `allowedHosts` explícito en `src/server.ts`, con `NG_ALLOWED_HOSTS` como override. | Angular 22 rechaza los `Host` no declarados; `angular.json` trae la lista vacía. | `allowedHosts: ["*"]` (riesgo SSRF). |
| 2026-10-29 | Pendiente | Render de `/` y `/admin/**`: Server/Client en vez de prerender. | Las páginas con datos quedan vacías en el HTML prerenderizado. | Prerender de `**` (estado actual). |
| 2026-10-29 | Pendiente | Login del admin de portfolio. | Hay auth con Google, pero falta confirmar guard y protección de `/admin`. | Admin sin login. |

## Estado

- Build `pnpm build`: **OK**, 9 rutas prerenderizadas (2026-10-29).
- Tests `pnpm test --watch=false`: **37 archivos, 39/39 pasan**.
- BFF `/ssr-api` verificado contra una API falsa: GET con query, POST con body, DELETE y 405 en métodos no permitidos.
- `GET /`, `/admin`, `/forbidden` y `/admin/url-grp` responden 200 con el servidor compilado; ruta inexistente responde 404.
- HOME completo; admin con dashboard y listados; CRUD de `url-grp` y `url` operativo.
- **Siguiente paso:** decidir el render por ruta y proteger `/admin` antes de conectar datos privados.

## Pendientes

- Cambiar `app.routes.server.ts`: `/` y `/admin/**` con `RenderMode.Server` o `Client`; el prerender de páginas con datos deja listas vacías.
- Definir `NG_ALLOWED_HOSTS` con el dominio real al desplegar.
- Confirmar el guard de `/admin` y el flujo de `auth` con Google.
- Completar el CRUD de language, technology y project (hoy listan y modelan, sin formulario).
- Implementar la subida de imágenes (`/{id}/upload-image`) en el BFF; hoy el proxy solo envía JSON.
- Corregir el `id` de `TitleComponent` para que funcionen las anclas del navbar.
- Quitar el bloque comentado de `error-interceptor` y el `console.log` que quede en features.
- Versionar `src/app/core/services/api-service.ts` (ya no tiene la key).
- Agregar script de lint.

## Problemas conocidos

- **SSR con URLs relativas:** el footer y los proyectos llaman a `/ssr-api` desde `rxResource`. En el navegador funciona; durante el prerender no hay origen y `catchError` deja las listas vacías en el HTML estático.
- **`allowedHosts` en `angular.json`:** está vacío (`[]`). Por eso `src/server.ts` pasa la lista explícita; sin `NG_ALLOWED_HOSTS`, el servidor solo acepta `localhost` y `127.0.0.1`.
- **`.env` fuera de git:** quedó fuera del commit y está en `.gitignore`; `.env.demo` es la plantilla. Nunca hubo remoto, así que la key no se publicó.
- `ROUTES_CONSTANTS.NOT_FOUND` apunta a `/not-found`, pero esa ruta no existe; la 404 cae por `**`.
- `ROUTES_CONSTANTS.ADMIN.LAMGUAGE` tiene un typo (`LAMGUAGE`), aunque la ruta `/admin/language` es correcta.
- `TitleComponent` usa `id={id}` sin un input `id`; las anclas `#id_Experience`, `#id_projects`, etc. no apuntan a nada.
- `FooterComponent` (shared) importa `UrlGrpDetailModel` desde una feature: dependencia invertida.
- `ConsoleComponent` usa `setTimeout` recursivo sin limpieza completa y tiene un `#scrollAnchor` sin uso.
- El navbar resuelve la navegación con `href` en algunos enlaces; puede recargar y perder el estado del router.
- El proxy no reenvía `Authorization` ni headers del navegador: si se agrega auth por token, hay que decidir explícitamente qué se propaga.

## Deuda técnica

- Mover modelos compartidos fuera de las features para romper dependencias invertidas.
- Portar el patrón de errores/toasts/confirmación del admin ya está iniciado; falta unificarlo con `MutationService`.
- Extender el BFF para multipart cuando se implementen las subidas.
- Agregar tests de servicios, rutas y componentes con datos; los specs actuales solo comprueban creación.
- Agregar lint (ESLint) y un script de formato.
