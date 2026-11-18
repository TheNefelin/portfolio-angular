# Desarrollo — portfolio-angular

> Memoria operativa: cómo funciona el proyecto hoy, qué está decidido y qué falta.
> Sin historial de cambios; para eso está git.

## Mapa

| Área | Dónde mirar | Cuándo |
|---|---|---|
| Bootstrap y providers | `src/main.ts`, `src/app/app.config.ts` | al agregar providers |
| Rutas y render | `src/app/app.routes.ts`, `src/app/app.routes.server.ts`, `src/app/features/*/*.routes.ts` | al agregar páginas o cambiar prerender/SSR |
| Layouts | `src/app/layouts/` (main, admin) | al cambiar el shell |
| HOME | `src/app/features/home/` | al ajustar secciones del inicio |
| Admin y CRUD | `src/app/features/{dashboard,url-grp,url,language,technology,project}/` | al tocar listados o formularios |
| Auth y guard | `src/app/features/auth/services/{auth-service,auth-google-service}.ts`, `src/app/core/guards/auth-guard.ts`, `src/app/core/services/session-service.ts` | al cablear el login o proteger rutas |
| API y BFF | `src/app/core/services/api-service.ts`, `src/server.ts`, `src/server/bff.ts`, `src/server/auth/*`, `src/server/crud/proxy.ts` | al cambiar rutas, métodos o el proxy |
| Feedback | `src/app/core/services/{error,toast,confirm,mutation}-service.ts`, `src/app/shared/components/{modal-error,modal-confirm,toast}-component/` | al cambiar mensajes o modales |
| Listados, UI y navegación | `src/app/shared/base/crud-page.ts`, `src/app/shared/components/`, `src/app/shared/constants/routes-constant.ts` | al cambiar paginación, filtro o navegación |
| Config | `angular.json`, `tsconfig.json`, `eslint.config.js`, `src/environments/environment.ts`, `.env.example` | al cambiar build, paths, lint o entorno |

## Cómo funciona

- Angular 22 standalone con SSR, Tailwind 4 + DaisyUI 5, rutas lazy por feature y ESLint (`angular-eslint`) vía `pnpm lint`. Alias `@core/*`, `@features/*`, `@layouts/*` y `@shared/*` en `tsconfig.json`.
- `/` monta `MainLayoutComponent` (HOME y auth); `/admin` monta `AdminLayoutComponent` (dashboard y CRUD); `/privacy-policy/navaja-suiza` es pública.
- Render: `/` en Server, `/admin/**` en Client, resto prerender. En prerender no hay origen y las listas quedan vacías.
- `ApiService` llama a `/ssr-api/{ruta}` **sin** `/api`: `API_URL` ya termina en `/api` y el BFF concatena. `src/server.ts` agrega `X-API-Key` y reenvía status y JSON.
- Feedback: `errorInterceptor` → `ErrorService` → `modal-error`; `ConfirmService` (promesa) → `modal-confirm`; `MutationService` → `ToastService` → `toast`. Se montan una vez en `app.html`.
- CRUD: `url-grp`, `url`, `language` y `technology` usan modal; `project` usa `/admin/project/form` y `/admin/project/form/:id`.
- Auth: `AuthPage` cablea solo Google; GitHub, Apple y email avisan «Disponible próximamente». `AuthService` (en `features/auth/services/`) usa `ApiService` y devuelve `Observable`; la sesión vive en **cookies HttpOnly** emitidas por el BFF, con CSRF y rate limiting. `loginGoogle` obtiene el token de Google vía GIS y llama `/ssr-api/auth/google`; el BFF setea la cookie y devuelve el body sin los tokens. `SessionService` cachea el perfil en un signal; `authGuard` protege `/admin` (redirige a `/auth`).

## Decisiones

| Estado | Decisión | Motivo |
|---|---|---|
| Aceptado | App única: HOME público + admin de portfolio; del admin de referencia solo se migra `features/portfolio/`. | Un solo despliegue; Game Guides es otro producto. |
| Aceptado | BFF `/ssr-api/{ruta}` sin namespace, con la API key solo en el proceso del servidor. | La key no puede quedar en el bundle. |
| Aceptado | El front llama `/ssr-api/{ruta}` sin `/api`, porque `API_URL` ya la incluye. | Evita `/api/api/...` y su 404. |
| Aceptado | Entorno con `process.loadEnvFile()`; el entorno del proceso manda. | Sin dependencias extra. |
| Aceptado | `allowedHosts` explícito con `NG_ALLOWED_HOSTS`. | Angular rechaza hosts no declarados. |
| Aceptado | Render por ruta: `/` Server, `/admin/**` Client, resto prerender. | SEO y datos por request en HOME; el admin es privado. |
| Aceptado | Feedback con componentes montados una vez en `app.html`. | Sin consumidor, `confirm()` nunca resuelve y el borrado cuelga. |
| Aceptado | `project` con página de formulario; el resto en modal. | Tiene selects y subida de imagen. |
| Aceptado | Se mantienen las dos URLs de privacy policy: `/privacy-policy/navaja-suiza` y `/navaja-suiza/privacy-policy`. | Ambas publicadas y con enlaces externos. |
| Aceptado | Client ID de Google en `environment.ts`, no en el BFF. | Es público por diseño; la API valida `aud` contra `GOOGLE_CLIENT_ID`. |
| Aceptado | Sesión en cookies HttpOnly emitidas por el BFF, con CSRF y rate limiting. | Los tokens no llegan al bundle del navegador; el BFF los gestiona. |

## Pendientes

- **Multipart en el BFF:** `image-picker` y `uploadImage` de project, language y technology hoy mandan `{}`.
- `TitleComponent` no declara el input `id`: las anclas del navbar no llegan a su sección.
- `FooterComponent` importa un modelo desde `url-grp`: dependencia invertida.
- `ConsoleComponent` deja `setTimeout` sin limpieza y un `#scrollAnchor` sin uso.
- El navbar usa `href` en algunos enlaces; puede recargar y perder estado del router.
- Definir `NG_ALLOWED_HOSTS` con el dominio real al desplegar.

## Seguridad

- `.env` está en `.gitignore` y nunca se versionó; `.env.example` es la plantilla. La API key solo existe en el proceso del servidor, nunca en el bundle del navegador.
- La sesión de auth vive en cookies HttpOnly emitidas por el BFF (`access_token`, `refresh_token`, `csrf_token`); el front no accede a los tokens. El BFF renueva la sesión automáticamente en el crudProxy cuando la API responde 401.

## Estado

- `pnpm test --watch=false`: 56 archivos, 61/61 (verificado el 2026-11-18).
- `pnpm build` OK, 1 ruta prerenderizada; `pnpm lint` limpio (verificado el 2026-11-18).
