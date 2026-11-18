# Sesión

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

El contrato de auth está alineado (cookies HttpOnly en el BFF). El siguiente trabajo de backend es tests de auth; en el frontend, el guard de `/admin`.

## Último avance comprobado

El frontend migró a sesión en cookies HttpOnly en el BFF (commit `192dcf7`): el BFF consume `access_token` de la API, setea cookies HttpOnly y elimina los tokens del body. `AuthService` usa `ApiAuthTokenResponse { access_token, refresh_token, token_type, expires_in }` y `me()` devuelve `UserProfile`. No hay interceptor de auth. Verificado por HTTP: `POST /ssr-api/auth/google` → 401 (token falso), `GET /ssr-api/auth/me` → 401 (sin cookie), `POST /ssr-api/auth/logout` → 200.

La memoria del frontend (`DEVELOPMENT.md`) y de la raíz quedaron actualizadas para reflejar el estado real.

## Archivos tocados

- `DEVELOPMENT.md` (raíz), `portfolio-angular/DEVELOPMENT.md`, `portfolio-python/DEVELOPMENT.md`
- `.baseline/session.md` (este archivo y el de `portfolio-python`)

## Pruebas ejecutadas y resultado real

- `pnpm test --watch=false` (portfolio-angular): 53 archivos, 62/62.
- `pnpm build` (portfolio-angular): OK, 7 rutas prerenderizadas.
- `pnpm lint` (portfolio-angular): limpio.
- Endpoints del BFF contra la API local por HTTP: los tres códigos de arriba.

## Bloqueos

- Ninguno en el contrato de auth.
- El guard de `/admin` sigue sin existir.

## Siguiente paso

Tests de auth en `portfolio-python` (aislar el fixture de `drop_all`) y guard de `/admin` en `portfolio-angular`.
