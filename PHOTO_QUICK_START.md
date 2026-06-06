# 🚀 Quick Start - Cambiar Foto de Perfil

## ⚡ 30 Segundos

El botón 📷 ya está en `UserHeader`:

```typescript
// En cualquier pantalla
import { UserHeader } from '../components/UserHeader';

export default function MyScreen() {
  return <UserHeader showChangePhoto={true} />;
}
```

**Listo.** El usuario presiona 📷 → selecciona foto → se sube → se actualiza.

## 📋 Requisitos

✅ Instalados automáticamente:
- `expo-image-picker` 
- `@react-native-firebase/storage`

⚙️ Configurar (en Firebase Console):

### 1. Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/profile-images/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### 2. Firestore Rules (ya configuradas para usuarios)
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

## 🎯 Uso

### Opción 1: Con UserHeader (Recomendado)
```typescript
<UserHeader 
  showActions={true}        // Botones Editar/Logout
  showChangePhoto={true}    // Botón 📷
/>
```

### Opción 2: Hook Directo
```typescript
import { useImagePicker } from '../hooks';

const { pickAndUploadImage, isLoading, error } = useImagePicker();

<Button onPress={pickAndUploadImage} loading={isLoading}>
  Cambiar Foto
</Button>
```

## 🔄 Flujo Automático

```
Usuario presiona 📷
    ↓
Selecciona foto de galería
    ↓
Edita foto (1:1)
    ↓
Se sube a Firebase Storage
    ↓
Se elimina foto anterior
    ↓
Se actualiza Firestore
    ↓
Se muestra foto nueva
```

## 📂 Carpetas Relevantes

```
lib/
  ├── firebase.ts      ← Inicialización
  ├── auth.ts          ← Auth functions
  └── storage.ts ✨    ← Foto functions

hooks/
  ├── useUserProfile.ts
  ├── useUpdateProfile.ts
  ├── useLogout.ts
  └── useImagePicker.ts ✨

components/
  └── UserHeader.tsx ✨  ← Botón 📷

docs/
  ├── profile-photo-guide.md ✨
  └── ... (5+ documentos)
```

## 📚 Documentación Completa

- **[PROFILE_PHOTO.md](PROFILE_PHOTO.md)** - Resumen completo
- **[docs/profile-photo-guide.md](docs/profile-photo-guide.md)** - Guía detallada
- **[docs/hooks-usage-guide.md](docs/hooks-usage-guide.md)** - Hook reference
- **[docs/integration-examples.md](docs/integration-examples.md)** - Ejemplos

## 🧪 Probar

1. Abre app en device/emulator
2. Ve a una pantalla con `UserHeader`
3. Presiona botón 📷
4. Selecciona foto
5. Espera a que se suba
6. Verifica foto actualizada
7. Abre Firebase Console → Storage → Verifica archivo

## ⚠️ Errores Comunes

| Error | Solución |
|-------|----------|
| "Necesitamos permisos" | User → Configuración → Permisos |
| No se sube | Verificar Storage Rules en Firebase |
| Foto no se ve | Verificar conexión + Storage URL correcta |

## 🎨 Customización

```typescript
// Cambiar emoji
// En UserHeader.tsx, línea ~40
<Button>🖼️</Button>  // 📷 → 🖼️

// Cambiar calidad
// En useImagePicker.ts, línea ~30
quality: 0.6,  // 0.1-1.0

// Cambiar aspecto
// En useImagePicker.ts, línea ~28
aspect: [4, 3],  // 1:1 → 4:3

// Cambiar tamaño
// En UserHeader.tsx, línea ~80
size={80}  // 56 → 80
```

## 🔗 API Reference

### `useImagePicker()`
```typescript
const { 
  pickAndUploadImage,  // () => Promise<void>
  isLoading,           // boolean
  error                // string | null
} = useImagePicker();
```

### Storage Functions
```typescript
// En lib/storage.ts
uploadProfileImage(uri: string): Promise<string>  // URL
deleteProfileImage(imageUrl: string): Promise<void>
```

---

**¿Más detalles?** Ver [PROFILE_PHOTO.md](PROFILE_PHOTO.md) o [docs/profile-photo-guide.md](docs/profile-photo-guide.md)
