# Flujo de Autenticación y Perfil en Firestore - NoteFlow

## 📋 Resumen de Implementación

El flujo de autenticación está completamente integrado con Firebase Auth y Firestore. La aplicación protege automáticamente las rutas verificando el estado de sesión.

## 🔄 Flujo de Registro

```
1. Usuario completa el formulario (nombre, email, contraseña)
   ↓
2. Se llama a registerUser() en lib/auth.ts
   ↓
3. Firebase Auth crea la cuenta con createUserWithEmailAndPassword()
   ↓
4. Se obtiene el uid del usuario
   ↓
5. Se crea un documento en Firestore bajo /users/{uid} con:
   - name: string
   - email: string
   - createdAt: timestamp (servidor)
   - avatarUrl: null
   ↓
6. onAuthStateChanged() detecta el cambio
   ↓
7. useAuthStore se actualiza con el usuario
   ↓
8. app/_layout.tsx redirige a la pantalla de notas
```

## 🔑 Flujo de Login

```
1. Usuario ingresa email y contraseña
   ↓
2. Se llama a loginUser() en lib/auth.ts
   ↓
3. Firebase Auth valida con signInWithEmailAndPassword()
   ↓
4. onAuthStateChanged() detecta el cambio
   ↓
5. useAuthStore se actualiza con el usuario
   ↓
6. app/_layout.tsx redirige a la pantalla de notas
```

## 🛡️ Protección de Rutas

En `app/_layout.tsx`:

```typescript
useEffect(() => {
  if (isInitializing) return;

  const inAuthGroup = segments[0] === '(auth)';

  if (user && inAuthGroup) {
    // Usuario autenticado → ir a notas
    router.replace('/(tabs)/notas');
  } else if (!user && !inAuthGroup) {
    // Usuario no autenticado → ir a login
    router.replace('/login');
  }
}, [user, segments, isInitializing]);
```

### Flujo de Rutas:

- **Sin usuario**: Solo se muestran pantallas de login y registro
- **Con usuario**: Solo se muestran las pantallas de la app (tabs, nueva-note)
- **Recarga de app**: Se valida el estado con onAuthStateChanged()

## 📂 Estructura de Firestore

```
firestore
└── users
    └── {uid}
        ├── name: string
        ├── email: string
        ├── createdAt: timestamp
        └── avatarUrl: string | null
```

## 🔧 Archivos Modificados

### `lib/firebase.ts` (NUEVO)
- Inicializa Firebase (automático desde google-services.json y GoogleService-Info.plist)

### `lib/auth.ts` (ACTUALIZADO)
```typescript
export async function registerUser(email, password, name): Promise<string>
// Crea usuario en Auth + documento en Firestore

export async function loginUser(email, password): Promise<string>
// Inicia sesión

export async function logoutUser(): Promise<void>
// Cierra sesión

export async function getUserProfile(userId): Promise<UserProfile | null>
// Obtiene perfil del usuario desde Firestore
```

### `store/authStore.ts` (ACTUALIZADO)
```typescript
interface AuthStore {
  user: auth.User | null           // Usuario actual de Firebase
  isLoading: boolean               // Estado de carga
  isInitializing: boolean          // Inicializando listeners
  error: string | null             // Mensajes de error
  
  initializeAuth(): void           // Escucha cambios de auth
  login(email, password): Promise<void>
  register(email, password, name): Promise<void>
  logout(): Promise<void>
}
```

### `app/login.tsx` (ACTUALIZADO)
- Usa Firebase Auth directamente
- Ruta corregida a `/(tabs)/notas`

### `app/register.tsx` (ACTUALIZADO)
- Nuevo campo de nombre
- Validación de contraseñas coincidentes
- Crea documento en Firestore automáticamente

### `app/_layout.tsx` (ACTUALIZADO)
- Inicializa listeners de autenticación
- Protege rutas basada en estado del usuario
- Muestra indicador de carga mientras se inicializa

## ✅ Casos de Uso

### 1. Usuario nuevo se registra
```
register.tsx → registerUser() → Firebase Auth + Firestore → onAuthStateChanged() → _layout.tsx redirige
```

### 2. Usuario existente inicia sesión
```
login.tsx → loginUser() → onAuthStateChanged() → _layout.tsx redirige
```

### 3. Acceso directo a app sin autenticación
```
_layout.tsx detecta no hay usuario → redirige a login
```

### 4. Recarga de app con usuario autenticado
```
initializeAuth() escucha onAuthStateChanged() → recupera usuario → muestra app
```

## 🚀 Próximos Pasos

Para completar el sistema:

1. **Crear pantalla de perfil**:
   ```typescript
   const userProfile = await getUserProfile(user.uid);
   ```

2. **Agregar foto de perfil**:
   - Subir a Firebase Storage
   - Actualizar avatarUrl en Firestore

3. **Permitir edición de perfil**:
   ```typescript
   await firestore().collection('users').doc(userId).update({
     name: newName,
     avatarUrl: newUrl
   });
   ```

4. **Agregar cierre de sesión**:
   - Botón que llama a `logout()` del store
   - Se redirige automáticamente a login

## ⚙️ Variables de Entorno Requeridas

En firebase.json (o app.json):
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

Ambos archivos están en la raíz del proyecto.

## 🐛 Manejo de Errores

Los errores se capturan automáticamente en `useAuthStore` y se muestran en la UI:

```typescript
if (error) {
  <PaperText style={styles.error}>{error}</PaperText>
}
```

Errores comunes:
- "auth/email-already-in-use" → Email ya registrado
- "auth/weak-password" → Contraseña muy corta
- "auth/user-not-found" → Usuario no existe
- "auth/wrong-password" → Contraseña incorrecta
