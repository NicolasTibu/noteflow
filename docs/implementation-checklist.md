# Checklist de Implementación - Autenticación Firebase

## ✅ Verificación de Configuración

### Paso 1: Firebase Configuration Files
- [ ] `google-services.json` existe en la raíz del proyecto (Android)
- [ ] `GoogleService-Info.plist` existe en la raíz del proyecto (iOS)
- [ ] Ambos archivos están referenciados en `app.json`

Verificar en `app.json`:
```json
{
  "plugins": [
    "@react-native-firebase/app"
  ]
}
```

### Paso 2: Dependencias Instaladas
```bash
npm list @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

Debe mostrar versión 24.0.0 o superior en las tres.

### Paso 3: Estructura de Archivos
- [x] `lib/firebase.ts` - Inicialización
- [x] `lib/auth.ts` - Funciones de autenticación
- [x] `store/authStore.ts` - State management
- [x] `app/login.tsx` - Pantalla de login
- [x] `app/register.tsx` - Pantalla de registro
- [x] `app/_layout.tsx` - Protección de rutas
- [x] `hooks/useUserProfile.ts` - Hook para obtener perfil
- [x] `hooks/useUpdateProfile.ts` - Hook para actualizar perfil
- [x] `hooks/useLogout.ts` - Hook para logout
- [x] `components/UserHeader.tsx` - Componente de usuario

### Paso 4: Firestore Security Rules (Importantes)

En la consola de Firebase, configurar reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Proteger colección de usuarios
    match /users/{userId} {
      // Solo el usuario propietario puede leer/escribir
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Paso 5: Probar el Flujo

#### Test 1: Registro
- [ ] Ir a pantalla de registro
- [ ] Completar formulario (nombre, email, contraseña)
- [ ] Hacer clic en "Registrarme"
- [ ] Verificar que se crea documento en Firestore
- [ ] Verificar que se redirige a `/notas`

En Firebase Console → Firestore → Collection `users`:
Debe aparecer documento con uid como ID.

#### Test 2: Login
- [ ] Logout desde la app
- [ ] Ir a pantalla de login
- [ ] Ingresar email y contraseña correctos
- [ ] Hacer clic en "Entrar"
- [ ] Verificar que se redirige a `/notas`

#### Test 3: Persistencia
- [ ] Recargar la app (dev reload)
- [ ] Verificar que sigue autenticado
- [ ] No debe volver a la pantalla de login

#### Test 4: Logout
- [ ] Llamar a `logout()` desde el store
- [ ] Verificar que se redirige a login
- [ ] Verificar que el usuario desapareció

#### Test 5: Acceso Protegido
- [ ] Intentar acceder a ruta sin usuario (ej: /notas)
- [ ] Debe redirigir automáticamente a login

### Paso 6: Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Firebase not initialized" | Firebase no se inicializó | Verificar google-services.json |
| "auth/network-request-failed" | Problema de conexión | Verificar conexión a internet |
| "auth/email-already-in-use" | Email ya registrado | Usar otro email |
| "auth/weak-password" | Contraseña < 6 caracteres | Usar contraseña más fuerte |
| "Missing Firestore data" | Rules no configuradas | Configurar Firestore Security Rules |

### Paso 7: Variables de Entorno (Opcional)

Si usas variables de entorno en app.json:

```json
{
  "extra": {
    "firebase": {
      "apiKey": "YOUR_API_KEY",
      "projectId": "YOUR_PROJECT_ID"
    }
  }
}
```

## 🚀 Deployment

### Android
```bash
eas build --platform android
eas submit --platform android
```

### iOS
```bash
eas build --platform ios
eas submit --platform ios
```

## 📊 Monitoreo

### Ver Logs en Firebase
1. Ir a Firebase Console
2. Authentication → Logs
3. Firestore → Collection `users`

### Monitorear Usuarios
```sql
-- En Firebase Console, SQL mode
SELECT * FROM users WHERE createdAt > TIMESTAMP_SUB(NOW(), INTERVAL 24 HOUR)
```

## 🔐 Seguridad

- ✅ Las contraseñas se manejan en Firebase (no se envían al cliente)
- ✅ Firestore Security Rules protegen los datos
- ✅ Solo el usuario autenticado puede ver su perfil
- ✅ Tokens se manejan automáticamente en Firebase

## 📝 Notas Finales

- Consulta `docs/authentication-flow.md` para detalles técnicos
- Ver `docs/example-profile-screen.tsx` para un ejemplo de pantalla de perfil
- Los hooks están en `hooks/index.ts` para importar fácilmente
