# Sesión

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Cerrar las features que faltan en `portfolio-angular` sin tocar auth, y cablear el feedback global.

## Último avance comprobado

CRUD de `url-grp`, `url`, `language`, `technology` y `project` funcionales. `modal-confirm` y `toast` montados en `app.html`. Render por ruta (`/` Server, `/admin/**` Client). ESLint configurado. Dashboard con accesos a cada CRUD, las dos URLs de privacy policy y `project` vuelve al listado tras crear.

## Archivos tocados

- `src/app/shared/components/modal-confirm-component/`
- `src/app/shared/components/toast-component/`
- `src/app/app.html`, `src/app/app.ts`
- `src/app/core/services/mutation-service.ts` (ToastService)
- `src/app/core/services/api-service.ts` (doble slash en upload)
- `src/app/layouts/{main,admin}-layout-component/`
- `src/app/app.routes.server.ts`
- `DEVELOPMENT.md`

## Pruebas ejecutadas y resultado real

- `pnpm build`: OK, 5 rutas prerenderizadas.
- `pnpm test --watch=false`: 48 archivos, 53/53.
- `pnpm lint`: sin errores.

## Bloqueos

- Subidas: el BFF solo acepta JSON, no multipart.
- Auth: interceptor sin registrar, sin guard, sin `/ssr-api/config`; la API de Python no monta el router de auth.

## Siguiente paso

Implementar multipart en el BFF (`server.ts`) para desbloquear `image-picker` y `uploadImage`. Después, cablear auth.
