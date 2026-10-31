# Sesión

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Cerrar las features de `portfolio-angular` sin auth. Los cinco CRUD y la HOME quedan completos; auth empieza por la UI.

## Último avance comprobado

CRUD de `url-grp`, `url`, `language`, `technology` y `project` funcionales, con `modal-confirm` y `toast` montados en `app.html`. Dashboard con tarjetas a cada CRUD. Las dos URLs de privacy policy funcionan y los tabs de NavajaSuiza muestran ES/EN/SV. `AuthPage` monta Google, GitHub, Apple y email/contraseña, con `loading`/`disabled` locales; aún sin llamar a `AuthService`.

## Archivos tocados

- `src/app/features/auth/` (componentes google, github, apple, login y `auth-page`)
- `src/app/features/privacy-policy/pages/navaja-suiza-page/`
- `src/app/features/dashboard/pages/dashboard-page/`
- `src/app/app.routes.ts`, `src/app/shared/constants/routes-constant.ts`
- `src/app/features/project/pages/project-form-page/project-form-page.ts`
- `DEVELOPMENT.md`

## Pruebas ejecutadas y resultado real

- `pnpm build`: OK, 6 rutas prerenderizadas.
- `pnpm test --watch=false`: 51 archivos, 56/56.
- `pnpm lint`: sin errores.
- Tabs de NavajaSuiza verificados en navegador: al elegir EN su panel pasa a `block` y ES/SV a `none`.

## Bloqueos

- Subidas: el BFF solo acepta JSON, no multipart.
- Auth: interceptor sin registrar, sin guard, sin `/ssr-api/config`; la API de Python no monta el router de auth y no tiene endpoints de GitHub ni Apple.

## Siguiente paso

Cablear `AuthPage` con `AuthService` (login real y manejo de `loading`), o implementar multipart en el BFF para desbloquear `image-picker`.
