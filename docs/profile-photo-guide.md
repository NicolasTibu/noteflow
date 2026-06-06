# 📸 Cambiar Foto de Perfil - Guía Completa

## 🎯 Descripción

Se ha agregado funcionalidad para que los usuarios puedan cambiar su foto de perfil usando:
- **expo-image-picker** para seleccionar la imagen
- **Firebase Storage** para almacenar las imágenes
- **Firestore** para guardar la URL

## 🔧 Componentes Implementados

### 1. `lib/storage.ts` (NUEVO)
Funciones para manejar Firebase Storage.

```typescript
export async function uploadProfileImage(uri: string): Promise<string>
// Sube imagen a Firebase Storage bajo /users/{uid}/profile-images/
// Retorna la URL de descarga

export async function deleteProfileImage(imageUrl: string): Promise<void>
// Elimina la imagen anterior de Firebase Storage
```

### 2. `hooks/useImagePicker.ts` (NUEVO)
Hook personalizado para seleccionar y subir imágenes.

```typescript
export function useImagePicker(): UseImagePickerResult {
  pickAndUploadImage: () => Promise<void>  // Selecciona y sube imagen
  isLoading: boolean                        // Cargando
  error: string | null                      // Errores
}
```

### 3. `components/UserHeader.tsx` (ACTUALIZADO)
Agregado botón de 📷 para cambiar foto con:
- Dialog de confirmación
- Indicador de carga
- Manejo automático de imagen anterior
- Prop `showChangePhoto` (default: true)

## 🚀 Uso Rápido

### En el Componente UserHeader

```typescript
import { UserHeader } from '../components/UserHeader';

export function MyScreen() {
  return (
    <View>
      {/* Con botón de cambiar foto */}
      <UserHeader showActions={true} showChangePhoto={true} />
      
      {/* Sin botón de cambiar foto */}
      <UserHeader showActions={true} showChangePhoto={false} />
    </View>
  );
}
```

### Usar el Hook Directamente

```typescript
import { useImagePicker } from '../hooks';

export function PhotoButton() {
  const { pickAndUploadImage, isLoading, error } = useImagePicker();

  return (
    <View>
      <Button
        onPress={pickAndUploadImage}
        loading={isLoading}
        disabled={isLoading}
      >
        Cambiar Foto
      </Button>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

## 📂 Estructura de Firebase Storage

```
Firebase Storage
└── users/
    └── {uid}/
        └── profile-images/
            ├── profile-{uid}-{timestamp}.jpg
            ├── profile-{uid}-{timestamp}.jpg
            └── ...
```

Cada foto se guarda con:
- **Path**: `users/{uid}/profile-images/`
- **Nombre**: `profile-{uid}-{timestamp}.jpg`
- **Ventaja**: Fácil de limpiar y organizar

## 🔄 Flujo de Carga

```
1. Usuario presiona botón 📷
   ↓
2. Dialog "¿Cambiar foto de perfil?"
   ↓
3. Solicitar permisos de galería
   ↓
4. Abrir picker con editing y aspect ratio 1:1
   ↓
5. Usuario selecciona foto
   ↓
6. Mostrar ActivityIndicator "Subiendo imagen..."
   ↓
7. Subir a Firebase Storage
   ↓
8. Obtener URL de descarga
   ↓
9. Eliminar foto anterior si existe
   ↓
10. Actualizar Firestore con nueva URL
   ↓
11. Refrescar perfil en la UI
   ↓
12. Mostrar foto actualizada
```

## 🔐 Seguridad en Firebase Storage

Configurar reglas en Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo usuarios autenticados pueden acceder a sus propias fotos
    match /users/{userId}/profile-images/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 📝 Permisos Requeridos

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### iOS (Info.plist)
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tu galería para cambiar tu foto de perfil</string>
```

Expo maneja esto automáticamente con `expo-image-picker`.

## ⚙️ Configuración de ImagePicker

```typescript
launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Solo imágenes
  allowsEditing: true,                               // Permitir cortar
  aspect: [1, 1],                                    // Cuadrado
  quality: 0.8,                                      // Compresión 80%
})
```

**Ventajas:**
- ✅ Proporción 1:1 (cuadrado)
- ✅ Usuario puede editar/cortar
- ✅ Compresión automática (menor tamaño)
- ✅ Solo imágenes

## 🎨 Personalización

### Cambiar Emoji del Botón

En `components/UserHeader.tsx`:
```typescript
<Button onPress={() => setShowChangePhotoDialog(true)}>
  🖼️  {/* Cambiar emoji */}
</Button>
```

### Cambiar Tamaño del Avatar

```typescript
<Avatar.Image size={80} source={{ uri: profile.avatarUrl }} />
```

### Cambiar Aspecto de la Foto

En `hooks/useImagePicker.ts`:
```typescript
aspect: [4, 3],  // Cambiar de [1, 1] a otro aspecto
```

## 📊 Consideraciones de Performance

### Tamaño de Imagen
```
- quality: 0.8 → ~50-100 KB por imagen
- quality: 0.9 → ~100-200 KB por imagen
- quality: 0.6 → ~30-50 KB por imagen
```

**Recomendación:** 0.7-0.8 es un buen balance.

### Caché de Imágenes
```typescript
// Forzar recarga de Avatar
<Avatar.Image
  key={profile?.avatarUrl}  // Cambiar clave para refrescar
  source={{ uri: profile.avatarUrl }}
/>
```

## 🐛 Manejo de Errores

Errores comunes y soluciones:

| Error | Causa | Solución |
|-------|-------|----------|
| "Necesitamos permisos" | Permisos no concedidos | Usuario debe ir a Configuración |
| "Error al subir imagen" | Conexión de red | Reintentar cuando haya conexión |
| "Error al eliminar imagen anterior" | Imagen ya eliminada | Es una advertencia, continúa |
| "Firebase not initialized" | Storage no configurado | Verificar google-services.json |

## 🔗 Importaciones

```typescript
// Usar hook
import { useImagePicker } from '../hooks';

// Usar componente
import { UserHeader } from '../components/UserHeader';

// Funciones de storage directamente
import { uploadProfileImage, deleteProfileImage } from '../lib/storage';
```

## ✅ Checklist de Implementación

- [ ] `expo-image-picker` instalado (`npm list expo-image-picker`)
- [ ] `lib/storage.ts` creado
- [ ] `hooks/useImagePicker.ts` creado
- [ ] `components/UserHeader.tsx` actualizado
- [ ] Firestore Security Rules configuradas
- [ ] Firebase Storage Rules configuradas
- [ ] Permisos en AndroidManifest.xml y Info.plist
- [ ] Probar cambio de foto en device
- [ ] Verificar que se guarda en Firebase Storage
- [ ] Verificar que se actualiza en Firestore

## 📸 Próximas Mejoras (Opcional)

1. **Cargar múltiples fotos** - Galería de fotos del perfil
2. **Crop avanzado** - Usar librería especializada
3. **Optimización** - Generar thumbnails
4. **Análisis** - Estadísticas de cambios de foto
5. **Social** - Compartir fotos en stories

## 🎓 Ejemplo Completo en Pantalla de Perfil

Ver `docs/integration-examples.md` para pantalla de perfil con:
- Cambiar foto
- Editar nombre
- Ver email
- Datos de creación
