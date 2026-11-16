# Sesión

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Alinear el contrato de auth entre `portfolio-angular` y `portfolio-python`. Es el bloqueante actual: el login de Google no completa.

## Último avance comprobado

El backend **sí** está implementado y montado: `portfolio-python/src/main.py` incluye `auth_router` bajo `/api` y expone `/api/auth/{google,login,register,refresh,logout,me}`. El BFF responde bien: `GET /ssr-api/url-grp` → 200, `GET /ssr-api/project/pagination` → 200 (17 proyectos), `POST /ssr-api/auth/google` → 401 con token falso. La memoria de los tres proyectos quedó actualizada (auth implementado, contratos anotados).

Desalineaciones confirmadas:

- La API devuelve `{access_token, refresh_token, token_type, expires_in}`; `AuthService` lee `{token, refresh_token, user}` → `token` queda `undefined`.
- La API no devuelve `user`; el front espera `id_user`/`picture` y la API usa `id`/`picture_url`.
- El `logout` del front manda `{refresh_token}`; la API exige `Bearer` y no recibe body.
- `authInterceptor` filtra por `/ssr-api/api/`, pero `ApiService` llama `/ssr-api/{ruta}`: nunca adjunta `Authorization`.

## Archivos tocados

- `DEVELOPMENT.md` (raíz), `portfolio-angular/DEVELOPMENT.md`, `portfolio-python/DEVELOPMENT.md`
- `.baseline/session.md` (este archivo y el de `portfolio-python`)

## Pruebas ejecutadas y resultado real

- `pnpm test --watch=false` (portfolio-angular): 52 archivos, 61/61.
- `pnpm build` (portfolio-angular): OK, 7 rutas prerenderizadas.
- Endpoints del BFF contra la API local, por HTTP: los tres códigos de arriba.
- `pytest` **no** se ejecutó: el fixture `setup_db` hace `drop_all` sobre la BD configurada, que puede ser la misma que usa la API en vivo.

## Bloqueos

- Falta decidir en qué lado se alinea el contrato (cambiar el DTO de la API o adaptar el front).

## Siguiente paso

Proponer el ajuste de contrato (preferible: que la API devuelva `token` y `user`, en la forma que el front ya consume) y luego el guard de `/admin`.
