# Seguridad API

## ¿Qué es SQL injection?

SQL injection es un ataque donde un atacante inserta código SQL malicioso en entradas que el servidor usa para construir consultas a la base de datos.

Ejemplo concreto:

Si una aplicación construye una consulta concatenando directamente el input del usuario:

```js
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

Y el atacante envía como `username` el valor:

```sql
' OR '1'='1
```

La consulta resultante sería:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...';
```

Esto puede permitir al atacante saltarse la autenticación o ejecutar comandos SQL no autorizados.

## Cómo previenen las consultas parametrizadas

Las consultas parametrizadas separan el SQL de los valores de entrada. El motor de la base de datos trata los parámetros como datos, no como parte del código SQL.

Ejemplo seguro:

```js
const result = await sql.query(
  'SELECT * FROM users WHERE username = $1 AND password = $2',
  [username, password]
);
```

Aquí, `username` y `password` se pasan por separado y el sistema garantiza que no puedan cambiar la estructura de la consulta.

## Variables de entorno y el connection string

Las variables de entorno son valores configurables que se guardan fuera del código fuente, por ejemplo en archivos como `.env.local` o en la configuración del entorno de ejecución.

Para una aplicación, se suele usar una variable como `DATABASE_URL` para almacenar el connection string.

¿Por qué el connection string nunca debe aparecer en el código?

- Porque contiene información sensible: usuario, contraseña, host y base de datos.
- Si el código se sube a un repositorio, esa información puede filtrarse fácilmente.
- Cambiar el connection string sin tocar el código es mucho más seguro y flexible.

## Protección adicional para tokens y secretos

En esta aplicación se usa autenticación basada en tokens JWT. Para que esto sea seguro:

- el secreto de firma JWT se define fuera del código en la variable `JWT_SECRET`.
- la app móvil guarda el token en `expo-secure-store` en lugar de `AsyncStorage`.
- los endpoints de notas verifican el token de `Authorization: Bearer <token>`.

Esto evita que el secreto o los tokens se filtren en el repositorio y reduce el riesgo de exposición en el cliente.

## Buenas prácticas

- guardar el connection string en una variable de entorno,
- excluir archivos locales como `.env.local` de control de versiones,
- documentar un `.env.example` con la clave vacía como plantilla,
- no almacenar secretos en el código fuente,
- usar `expo-secure-store` para datos sensibles en dispositivos móviles.
