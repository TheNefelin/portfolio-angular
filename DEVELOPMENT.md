# Desarrollo — portfolio-angular

> Memoria operativa: cómo funciona el proyecto hoy, qué está decidido y qué falta.
> Sin historial de cambios; para eso está git.

## Mapa

| Área | Dónde mirar | Cuándo |
|---|---|---|
| Bootstrap y providers | `src/main.ts`, `src/app/app.config.ts` | al agregar providers |
| Rutas | `src/app/app.routes.ts`, `src/app/features/*/*.routes.ts` | al agregar páginas |
| Render por ruta | `src/app/app.routes.server.ts` | al cambiar prerender/SSR |
| Layouts | `src/app/layouts/` (`main-layout` público, `admin-layout` privado) | al cambiar el shell |
| HOME | `src/app/features/home/` | al ajustar secciones del inicio |
| Admin y CRUD | `src/app/features/{dashboard,url-grp,url,language,technology,project}/` | al tocar listados o formularios |
| Auth | `src/app/core/services/auth-service.ts`, `src/app/core/interceptors/auth-interceptor.ts`, `src/app/features/auth/` | al cablear el login |
| Cliente de API | `src/app/core/services/api-service.ts` | al cambiar rutas o métodos |
| BFF | `src/server.ts` | al tocar `/ssr-api`, multipart o variables de entorno |
| Feedback | `src/app/core/services/{error,toast,confirm,mutation}-service.ts`, `src/app/shared/components/{modal-error,modal-confirm,toast}-component/` | al cambiar mensajes o modales |
| Base de listados | `src/app/shared/base/crud-page.ts` | al cambiar paginación o filtro |
| Navegación | `src/app/shared/constants/routes-constant.ts` | al agregar rutas o ítems del menú |
| Compartidos | `src/app/shared/components/` | al reutilizar UI |
| Config | `angular.json`, `tsconfig.json`, `eslint.config.js`, `.env.demo` | al cambiar build, paths, lint o entorno |

## Cómo funciona

- Angular 22 standalone con SSR, Tailwind 4 + DaisyUI 5 y rutas lazy por feature.
- `/` monta `MainLayoutComponent` (HOME y auth); `/admin` monta `AdminLayoutComponent` (dashboard y CRUD); `/privacy-policy/navaja-suiza` es pública.
- Render: `/` en Server, `/admin/**` en Client, resto prerender. En Server, `/ssr-api` relativo resuelve contra el request; en prerender no hay origen y las listas quedan vacías.
- `ApiService` llama a `/ssr-api/{ruta}` sin credenciales. `src/server.ts` agrega `X-API-Key` y reenvía status y JSON.
- Feedback: `errorInterceptor` → `ErrorService` → `modal-error`; `ConfirmService` (promesa) → `modal-confirm`; `MutationService` → `ToastService` → `toast`. Los tres componentes se montan una vez en `app.html`.
- CRUD: `url-grp`, `url`, `language` y `technology` usan modal; `project` usa las páginas `/admin/project/form` y `/admin/project/form/:id`.
- Auth: `AuthService` (Google y refresh, persiste en `sessionStorage`) y `authInterceptor` existen pero **no están registrados**; `/admin` sigue sin guard.
- Alias `@core/*`, `@features/*`, `@layouts/*` y `@shared/*` en `tsconfig.json`; ESLint con `angular-eslint` vía `pnpm lint`.

## Decisiones

| Estado | Decisión | Motivo |
|---|---|---|
| Aceptado | App única: HOME público + admin de portfolio. | Un solo despliegue y sin duplicar Astro. |
| Aceptado | Solo se migra `features/portfolio/` del admin de referencia. | Game Guides es otro producto. |
| Aceptado | BFF `/ssr-api/{ruta}` sin namespace. | Una sola API; la key no entra al bundle. |
| Aceptado | Entorno con `process.loadEnvFile()`; el entorno del proceso manda. | Sin dependencias extra. |
| Aceptado | `allowedHosts` explícito con `NG_ALLOWED_HOSTS`. | Angular rechaza hosts no declarados y `angular.json` lo trae vacío. |
| Aceptado | Render por ruta: `/` Server, `/admin/**` Client, resto prerender. | SEO y datos por request en HOME; el admin es privado. |
| Aceptado | Feedback con componentes montados una vez en `app.html`. | Sin consumidor, `confirm()` nunca resuelve y el borrado cuelga. |
| Aceptado | ESLint con `angular-eslint` y reglas de accesibilidad de templates. | Verificación automática, no solo revisión visual. |
| Aceptado | `project` con página de formulario; el resto en modal. | Tiene selects y subida de imagen. |
| Aceptado | Mantener las dos URLs de privacy policy: `/privacy-policy/navaja-suiza` y `/navaja-suiza/privacy-policy`. | Ambas están publicadas y hay enlaces externos a las dos. |
| Pendiente | Auth sin namespace: el BFF ignora `{ns}`. | Hoy `/ssr-api/{ns}/auth/*` no llega a la API. |
| Pendiente | Sesión en `sessionStorage` vs cookie `httpOnly`. | Cualquier XSS lee los tokens. |

## Pendientes

- Implementar multipart en el BFF: `image-picker` y `uploadImage` de project, language y technology hoy mandan `{}`.
- Cablear auth: registrar `authInterceptor` con regex sin namespace, `/ssr-api/config` que exponga `GOOGLE_CLIENT_ID`, guard de `/admin` y montar el router de auth en `portfolio-python` (hoy no está incluido en `main.py`).
- Corregir el `id` de `TitleComponent`: usa `id={id}`, las anclas del navbar no apuntan a nada.
- `FooterComponent` importa un modelo desde `url-grp`: dependencia invertida.
- `ConsoleComponent` deja `setTimeout` sin limpieza y un `#scrollAnchor` sin uso.
- El navbar usa `href` en algunos enlaces; puede recargar y perder estado del router.
- Restaurar `NG_ALLOWED_HOSTS` en `.env.demo` y definirlo con el dominio real al desplegar.
- Quitar el bloque comentado de `error-interceptor`.

## Seguridad

- `.env` está en `.gitignore` y nunca se versionó; `.env.demo` es la plantilla.
- La API key solo existe en el proceso del servidor, nunca en el bundle del navegador.
- Los tokens de auth viven en `sessionStorage`: cualquier XSS los lee. La alternativa es cookie `httpOnly` emitida por el BFF.

## Estado

- `pnpm build` OK, 6 rutas prerenderizadas.
- `pnpm test --watch=false`: 48 archivos, 53/53.
- `pnpm lint`: limpio.
