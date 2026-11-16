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
| Auth | `src/app/core/services/auth-service.ts`, `src/app/core/interceptors/auth-interceptor.ts`, `src/app/features/auth/` | al cablear el login |
| API y BFF | `src/app/core/services/api-service.ts`, `src/server.ts`, `src/server/proxy/api-proxy.ts` | al cambiar rutas, métodos o el proxy |
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
- Auth: `AuthPage` cablea solo Google; GitHub, Apple y email avisan «Disponible próximamente». `AuthService` llama `/ssr-api/auth/{google,refresh,logout}` y guarda `{token, refresh_token, user}` en `sessionStorage`; `authInterceptor` refresca en 401. `/admin` sigue sin guard.

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
| Pendiente | Sesión en `sessionStorage` vs cookie `httpOnly`. | Cualquier XSS lee los tokens. |

## Pendientes

- **Contrato de auth desalineado con `portfolio-python`** (bloquea el login): la API devuelve `{access_token, refresh_token, token_type, expires_in}` y `AuthService` lee `{token, refresh_token, user}` → `token` queda `undefined`; la API no devuelve `user` y el front espera `id_user`/`picture`; el `logout` del front manda `{refresh_token}` y la API exige `Bearer`.
- **`authInterceptor` nunca adjunta el token:** filtra por `/ssr-api/api/`, pero `ApiService` llama `/ssr-api/{ruta}`.
- **Guard de `/admin`:** no existe; el admin sigue abierto.
- **Multipart en el BFF:** `image-picker` y `uploadImage` de project, language y technology hoy mandan `{}`.
- `TitleComponent` no declara el input `id`: las anclas del navbar no llegan a su sección.
- `FooterComponent` importa un modelo desde `url-grp`: dependencia invertida.
- `ConsoleComponent` deja `setTimeout` sin limpieza y un `#scrollAnchor` sin uso.
- El navbar usa `href` en algunos enlaces; puede recargar y perder estado del router.
- Definir `NG_ALLOWED_HOSTS` con el dominio real al desplegar.

## Seguridad

- `.env` está en `.gitignore` y nunca se versionó; `.env.example` es la plantilla. La API key solo existe en el proceso del servidor, nunca en el bundle del navegador.
- Los tokens de auth viven en `sessionStorage`: cualquier XSS los lee. La alternativa es cookie `httpOnly` emitida por el BFF.

## Estado

- `pnpm test --watch=false`: 52 archivos, 61/61 (verificado el 2026-11-15).
- `pnpm build` OK, 7 rutas prerenderizadas; `pnpm lint` limpio (última corrida registrada).
