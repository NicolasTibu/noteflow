# Teoría de Backend

## Patrón cliente-servidor

El patrón cliente-servidor es una arquitectura en la que dos partes distintas interactúan:

- El cliente envía peticiones y consume servicios.
- El servidor recibe esas peticiones, procesa la lógica y responde con datos o acciones.

Esto permite separar responsabilidades: el cliente gestiona la interfaz y la experiencia de usuario, mientras el servidor gestiona el almacenamiento, la seguridad y la lógica de negocio.

## ¿Qué es una API REST?

Una API REST (Representational State Transfer) es un estilo arquitectónico para diseñar servicios web.

Características principales:

- Usa HTTP como protocolo de transporte.
- Trabaja con recursos, que son representaciones de datos accesibles mediante URLs.
- Sigue operaciones estándar sobre esos recursos.
- Es stateless, es decir, cada petición contiene toda la información necesaria y no depende del estado previo en el servidor.

## Métodos HTTP

Los métodos HTTP más comunes en una API REST son:

- `GET`: recuperar datos sin modificar nada.
- `POST`: crear un nuevo recurso.
- `PUT`: actualizar un recurso completo.
- `PATCH`: actualizar parcialmente un recurso.
- `DELETE`: borrar un recurso.

Otros métodos existen (`HEAD`, `OPTIONS`, `TRACE`, etc.), pero los anteriores son los que se usan normalmente en APIs REST.

## DDL vs DML

En bases de datos, hay dos familias principales de sentencias SQL:

- DDL (Data Definition Language) define la estructura de la base de datos:
  - `CREATE`: crear tablas, índices y otros objetos.
  - `ALTER`: modificar la estructura existente.
  - `DROP`: eliminar objetos.
- DML (Data Manipulation Language) manipula los datos almacenados:
  - `SELECT`: consultar datos.
  - `INSERT`: añadir nuevos registros.
  - `UPDATE`: modificar registros existentes.
  - `DELETE`: borrar registros.

## JOIN en SQL

Las cláusulas `JOIN` se usan para combinar filas de dos tablas basadas en una condición común.

- `INNER JOIN` devuelve sólo las filas que tienen coincidencia en ambas tablas.
- `LEFT JOIN` devuelve todas las filas de la tabla izquierda y las coincidencias de la tabla derecha.
  - Si no hay coincidencia en la tabla derecha, las columnas de esa tabla aparecen como `NULL`.

### Ejemplo práctico

Para una aplicación de notas, una nota puede no tener elementos de checklist, pero aún así queremos seguir mostrando la nota.

- `INNER JOIN` sería apropiado cuando sólo interesa obtener notas que ya tienen al menos un elemento de checklist.
- `LEFT JOIN` es la opción correcta cuando queremos todas las notas y sus items opcionales: las notas sin items también deben aparecer.

En este proyecto usamos `LEFT JOIN` para unir `notes` con `checklist_items` y `note_tags`, de modo que las notas sin elementos o etiquetas sigan apareciendo en el resultado.

## Autenticación y autorización

La aplicación también implementa autenticación basada en tokens JWT.

- El servidor crea un token cuando el usuario se registra o inicia sesión.
- El cliente envía ese token en el encabezado `Authorization: Bearer <token>`.
- El servidor verifica el token antes de devolver notas y checklist items.

Además de la autenticación, cada nota pertenece a un propietario.
Los datos devueltos por `/api/notes` son sólo las notas del usuario autenticado.

## Diagrama entidad-relación actualizado

Para el proyecto de notas se usan cuatro tablas principales:

- `users`
  - `id`: identificador único.
  - `email`: correo electrónico único.
  - `password_hash`: contraseña hasheada.
  - `created_at`: fecha de creación.

- `notes`
  - `id`: identificador único.
  - `owner_id`: referencia a `users.id`.
  - `title`: título de la nota.
  - `content`: cuerpo o contenido completo.
  - `type`: tipo de nota (`note`, `checklist`, `idea`).
  - `color`: color asociado.
  - `created_at`: fecha de creación.
  - `updated_at`: fecha de última modificación.

- `checklist_items`
  - `id`: identificador único.
  - `note_id`: referencia a `notes.id`.
  - `text`: texto del elemento de la lista.
  - `is_completed`: estado de completado.

- `note_tags`
  - `id`: identificador único.
  - `note_id`: referencia a `notes.id`.
  - `tag`: etiqueta asociada.

Relaciones:

- `users` 1 — N `notes`: cada usuario tiene sus propias notas.
- `notes` 1 — N `checklist_items`: una nota de tipo checklist puede tener varios elementos.
- `notes` 1 — N `note_tags`: una nota puede tener varias etiquetas.
- Las claves foráneas `note_id` en `checklist_items` y `note_tags` apuntan a `notes(id)` con eliminación en cascada.
- La clave foránea `owner_id` en `notes` apunta a `users(id)` con eliminación en cascada.

## Códigos de estado HTTP

Los códigos de estado HTTP indican el resultado de una petición:

- `2xx` (éxito): la petición se procesó correctamente.
  - `200 OK`: petición correcta.
  - `201 Created`: recurso creado con éxito.
  - `204 No Content`: petición correcta pero no hay cuerpo en la respuesta.

- `4xx` (error del cliente): la petición es inválida o no se permite.
  - `400 Bad Request`: la petición es malformada.
  - `401 Unauthorized`: falta autenticación.
  - `403 Forbidden`: no se tiene permiso.
  - `404 Not Found`: recurso no encontrado.

- `5xx` (error del servidor): el servidor falló al procesar la petición.
  - `500 Internal Server Error`: error genérico del servidor.
  - `502 Bad Gateway`: error en un servidor intermedio.
  - `503 Service Unavailable`: servicio no disponible.

Estos códigos ayudan a los clientes a interpretar si la petición fue exitosa, si hubo un problema de validación, o si el servidor no pudo completar la operación.
