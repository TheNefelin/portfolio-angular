# Sesión

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Limpiar la feature de auth y dejar cableado solo el login de Google.

## Último avance comprobado

`AuthPage` llama a `AuthService.loginWithGoogle()`, que toma el client ID de `environment.googleClientId` (ya no de `/ssr-api/config`) y cambia el `access_token` por una sesión en `/ssr-api/api/auth/google`. `authInterceptor` está registrado y agrega `Authorization` a `/ssr-api/api/*`, con refresh en 401. La sesión se lee de `sessionStorage` una sola vez y vive en memoria. GitHub, Apple y email siguen sin backend: muestran «Disponible próximamente».

## Archivos tocados

- `src/app/core/services/auth-service.ts`
- `src/app/core/interceptors/{auth,error}-interceptor.ts`
- `src/app/app.config.ts`
- `src/app/features/auth/pages/auth-page/` y `components/auth-{google,github,apple,login}-component/`
- `src/environments/environment.ts`, `tsconfig.json`, `DEVELOPMENT.md`

## Pruebas ejecutadas y resultado real

- `pnpm build`: OK, 6 rutas prerenderizadas.
- `pnpm test`: 51 archivos, 56/56.
- `pnpm lint`: sin errores.
- Bundle: el client ID aparece en `main-*.js` (es público); `X-API-Key` no aparece.

## Bloqueos

- `/ssr-api/api/auth/*` devuelve 404: `portfolio-python` no monta el router de auth y el módulo no importa.
- `/admin` sigue sin guard.
- Multipart en el BFF pendiente.

## Siguiente paso

Montar el router de auth en `portfolio-python` y alinear `GOOGLE_CLIENT_ID` de la API con el client ID del front. Sin eso el login no completa.
