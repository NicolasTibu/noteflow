# Respuestas reales de la API `/api/notes`

Pruebas ejecutadas contra `http://localhost:4000` (dev server en `noteflow-api`). Salidas obtenidas (orden cronológico):

---

### GET /api/notes
Status: 200
Body:
```
[
  {
    "id": "20efd6e2-881b-40f3-a9da-9dfc7f3d7b9a",
    "title": "inspect",
    "content": null,
    "type": "note",
    "color": null,
    "created_at": "2026-05-26T13:05:42.063Z",
    "updated_at": "2026-05-26T13:05:42.063Z"
  },
  {
    "id": "1c590581-6321-4367-8bc8-2ecc1e694597",
    "title": "Prueba automatizada",
    "content": "Contenido de prueba desde script",
    "type": "note",
    "color": "#00ff00",
    "created_at": "2026-05-26T13:03:59.276Z",
    "updated_at": "2026-05-26T13:03:59.276Z"
  }
]
```

### POST /api/notes
Request body:
```
{ "title": "Prueba automatizada", "type": "note", "content": "Contenido de prueba desde script", "color": "#00ff00" }
```
Response status: 201
Body:
```
{
  "id": "d77f0828-db19-4b57-9d30-f75a8834c336",
  "title": "Prueba automatizada",
  "content": "Contenido de prueba desde script",
  "type": "note",
  "color": "#00ff00",
  "created_at": "2026-05-26T13:06:31.827Z",
  "updated_at": "2026-05-26T13:06:31.827Z"
}
```

### GET /api/notes/d77f0828-db19-4b57-9d30-f75a8834c336
Status: 200
Body:
```
{
  "id": "d77f0828-db19-4b57-9d30-f75a8834c336",
  "title": "Prueba automatizada",
  "content": "Contenido de prueba desde script",
  "type": "note",
  "color": "#00ff00",
  "created_at": "2026-05-26T13:06:31.827Z",
  "updated_at": "2026-05-26T13:06:31.827Z"
}
```

### PATCH /api/notes/d77f0828-db19-4b57-9d30-f75a8834c336
Status: 200
Body:
```
{
  "id": "d77f0828-db19-4b57-9d30-f75a8834c336",
  "title": "Actualizada por script",
  "content": "Contenido de prueba desde script",
  "type": "note",
  "color": "#00ff00",
  "created_at": "2026-05-26T13:06:31.827Z",
  "updated_at": "2026-05-26T13:06:32.508Z"
}
```

### DELETE /api/notes/d77f0828-db19-4b57-9d30-f75a8834c336
Status: 204
Body: (empty)

### GET /api/notes (final)
Status: 200
Body: listado actualizado (la nota borrada ya no aparece en el resultado):
```
[
  {
    "id": "20efd6e2-881b-40f3-a9da-9dfc7f3d7b9a",
    "title": "inspect",
    "content": null,
    "type": "note",
    "color": null,
    "created_at": "2026-05-26T13:05:42.063Z",
    "updated_at": "2026-05-26T13:05:42.063Z"
  },
  {
    "id": "1c590581-6321-4367-8bc8-2ecc1e694597",
    "title": "Prueba automatizada",
    "content": "Contenido de prueba desde script",
    "type": "note",
    "color": "#00ff00",
    "created_at": "2026-05-26T13:03:59.276Z",
    "updated_at": "2026-05-26T13:03:59.276Z"
  }
]
```

---

Notas y arreglos realizados:

- Inicialmente las rutas devolvían 500/404 debido a dos problemas:
  1. `noteflow-api` usaba la dependencia `@/lib/db` que resolvía a la `lib/db.ts` del workspace raíz. Copié/creé `noteflow-api/lib/db.ts` y cambié las importaciones de las rutas a la versión local (`../../../lib/db`), asegurando que usaran el helper correcto.
  2. La envoltura `query()` necesitaba normalizar la respuesta de `sql.query(...)` (en este entorno el método devuelve directamente un array). Ajusté `noteflow-api/lib/db.ts` para devolver el array resultante.

Tras estos cambios reinicié el servidor en `PORT=4000` y ejecuté la secuencia automática de pruebas (GET, POST, GET id, PATCH, DELETE), registrando las respuestas anteriores.

Si quieres, puedo:
- Limpiar las notas de prueba en la base de datos.
- Añadir un script `npm run test:api` para reproducir estas comprobaciones automáticamente.
