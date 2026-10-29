# Desarrollo — portfolio-angular

> Memoria operativa: cómo funciona el proyecto hoy, qué está decidido y qué falta.
> Sin historial de cambios; para eso está git.

## Mapa

| Área | Dónde mirar | Cuándo |
|---|---|---|
| Bootstrap y providers | `src/main.ts`, `src/app/app.config.ts` | al agregar providers |
| Rutas | `src/app/app.routes.ts`, `src/app/features/*/*.routes.ts` | al agregar páginas |
| Render por ruta | `src/app/app.routes.server.ts` | al cambiar prerender/SSR |
| Layouts | `src/app/layouts/` | al cambiar el shell público o admin |
| HOME | `src/app/features/home/` | al ajustar secciones del inicio |
| Admin y CRUD | `src/app/features/{dashboard,url-grp,url,language,technology,project}/` | al tocar listados o formularios |
| Auth | `src/app/features/auth/` | al tocar el login con Google |
| Cliente de API | `src/app/core/services/api-service.ts` | al cambiar rutas o métodos |
| BFF | `src/server.ts` | al tocar `/ssr-api` o variables de entorno |
| Errores y feedback | `src/app/core/interceptors/`, `src/app/core/services/*-service.ts` | al cambiar toasts, errores o confirmaciones |
| Base de listados | `src/app/shared/base/crud-page.ts` | al cambiar paginación o filtro |
| Navegación | `src/app/shared/constants/routes-constant.ts` | al agregar rutas o ítems del menú |
| Compartidos | `src/app/shared/components/` | al reutilizar UI |
| Config y alias | `angular.json`, `tsconfig.json`, `.env.demo` | al cambiar build, paths o entorno |

## Cómo funciona

- Angular 22 standalone con SSR, Tailwind 4 + DaisyUI 5 y rutas lazy por feature.
- `/` monta `HomeLayoutComponent` (HOME y auth); `/admin` monta `UserLayoutComponent` con dashboard y un listado por entidad; `**` va a 404.
- El HOME pide proyectos y el footer se arma con `urlGrpDetail` desde `HomeLayoutComponent`.
- `ApiService` llama a `/ssr-api/{ruta}` sin credenciales. `src/server.ts` agrega `X-API-Key` y reenvía status y JSON.
- `errorInterceptor` normaliza el `detail` de FastAPI y lo publica en `ErrorService`.
- Los alias `@core/*`, `@features/*`, `@layouts/*` y `@shared/*` se definen en `tsconfig.json` para app y tests.

## Decisiones

| Estado | Decisión | Motivo |
|---|---|---|
| Aceptado | App única: HOME público + admin de portfolio. | Un solo despliegue y sin duplicar Astro. |
| Aceptado | Solo se migra `features/portfolio/` del admin de referencia. | Game Guides es otro producto. |
| Aceptado | BFF `/ssr-api/{ruta}` sin namespace. | Una sola API; la key no entra al bundle. |
| Aceptado | Entorno con `process.loadEnvFile()`; el entorno del proceso manda. | Sin dependencias extra. |
| Aceptado | `allowedHosts` explícito con `NG_ALLOWED_HOSTS`. | Angular rechaza hosts no declarados y `angular.json` lo trae vacío. |
| Pendiente | Render de `/` y `/admin/**` como Server/Client. | El prerender deja vacías las listas que vienen de la API. |
| Pendiente | Login y protección de `/admin`. | Hay auth con Google, falta el guard. |

## Pendientes

- Cambiar `app.routes.server.ts`: `/` y `/admin/**` fuera del prerender.
- Definir `NG_ALLOWED_HOSTS` con el dominio real al desplegar.
- Confirmar el guard de `/admin` y el flujo de Google.
- Completar el CRUD de language, technology y project (hoy listan y modelan).
- Implementar subidas multipart en el BFF (`/{id}/upload-image`).
- Corregir el `id` de `TitleComponent`: las anclas del navbar no apuntan a nada.
- `ROUTES_CONSTANTS.NOT_FOUND` apunta a `/not-found`, que no existe; hay un typo `LAMGUAGE`.
- `FooterComponent` importa un modelo desde una feature: dependencia invertida.
- `ConsoleComponent` deja `setTimeout` sin limpieza y un `#scrollAnchor` sin uso.
- El navbar usa `href` en algunos enlaces; puede recargar y perder estado del router.
- Decidir si el BFF debe propagar `Authorization` (hoy no lo hace).
- Quitar el bloque comentado de `error-interceptor`.
- Agregar lint.

## Seguridad

- `.env` está en `.gitignore` y nunca se versionó; `.env.demo` es la plantilla.
- La API key solo existe en el proceso del servidor, nunca en el bundle del navegador.
