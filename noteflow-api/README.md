# Noteflow API

Este proyecto contiene el backend de NoteFlow, construido con Next.js App Router y Neon Postgres.

## Requisitos

- Node.js 18+
- `DATABASE_URL` configurada en el entorno
- `JWT_SECRET` configurado en el entorno

## Instalación

```bash
cd noteflow-api
npm install
```

## Variables de entorno

Crea un archivo `.env.local` con estas variables:

```env
DATABASE_URL=
JWT_SECRET=
```

- `DATABASE_URL`: conexión a Neon Postgres.
- `JWT_SECRET`: clave secreta para firmar tokens JWT.

## Comandos

```bash
npm run dev
npm run build
npm start
```

## Endpoints

### Autenticación

- `POST /api/auth/register`
  - Crea una cuenta nueva.
  - Recibe `{ email, password }`.
  - Devuelve `{ user, token }`.

- `POST /api/auth/login`
  - Inicia sesión con `email` y `password`.
  - Devuelve `{ user, token }`.

### Notas protegidas

Todas las rutas de notas requieren el encabezado `Authorization: Bearer <token>`.

- `GET /api/notes`
  - Recupera notas del usuario autenticado.

- `POST /api/notes`
  - Crea una nota para el usuario autenticado.

- `GET /api/notes/:id`
  - Recupera una nota propia por id.

- `PATCH /api/notes/:id`
  - Actualiza una nota propia.

- `DELETE /api/notes/:id`
  - Elimina una nota propia.

### Checklist items protegidos

- `GET /api/notes/:id/checklist-items`
  - Recupera los items de checklist de una nota propia.

- `POST /api/notes/:id/checklist-items`
  - Añade un item a una nota propia.

- `PATCH /api/checklist-items/:itemId`
  - Marca o desmarca un item propio.

- `DELETE /api/checklist-items/:itemId`
  - Elimina un item propio.

## Despliegue

Al desplegar en Vercel o cualquier plataforma compatible, configura las variables de entorno `DATABASE_URL` y `JWT_SECRET`.

También asegúrate de que la base de datos tenga la tabla `users` y la columna `owner_id` en `notes` para gestionar la propiedad de los recursos.
