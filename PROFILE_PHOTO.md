# 📸 Cambiar Foto de Perfil - Resumen de Implementación

## ✨ ¿Qué se agregó?

Se implementó funcionalidad completa para que los usuarios cambien su foto de perfil usando:
- **expo-image-picker** para seleccionar imágenes de la galería
- **Firebase Storage** para almacenar las imágenes
- **Hook personalizado** para simplificar el uso

## 📦 Archivos Agregados/Modificados

### ✅ Nuevos
- `lib/storage.ts` - Funciones para Firebase Storage
- `hooks/useImagePicker.ts` - Hook para seleccionar y subir imágenes
- `docs/profile-photo-guide.md` - Guía completa de foto de perfil

### 🔄 Actualizados
- `components/UserHeader.tsx` - Botón 📷 para cambiar foto
- `hooks/index.ts` - Exportar nuevo hook
- `docs/hooks-usage-guide.md` - Documentar useImagePicker
- `docs/integration-examples.md` - Agregar ejemplos con foto
- `AUTHENTICATION.md` - Mencionar nueva funcionalidad

## 🎯 Características

✅ **Seleccionar foto de galería** - Con preview y edición 1:1  
✅ **Subir a Firebase Storage** - Organizadas por usuario  
✅ **Eliminar foto anterior** - Limpieza automática  
✅ **Actualizar Firestore** - Guardar URL de descarga  
✅ **Refrescar UI** - Mostrar foto actualizada automáticamente  
✅ **Manejo de errores** - Permisos, conexión, etc.  
✅ **Indicador de carga** - UX mejorada durante carga  
✅ **Dialog de confirmación** - Interfaz intuitiva  

## 🚀 Uso Rápido

### Con UserHeader (Más Simple)
```typescript
// Ya incluye botón de cambiar foto
<UserHeader showActions={true} showChangePhoto={true} />
```

### Con Hook Directo (Más Control)
```typescript
const { pickAndUploadImage, isLoading, error } = useImagePicker();

<Button onPress={pickAndUploadImage} loading={isLoading}>
  Cambiar Foto
</Button>
```

## 📂 Estructura en Firebase

```
Firebase Storage
└── users/
    └── {uid}/
        └── profile-images/
            ├── profile-{uid}-{timestamp}.jpg  ← Nueva foto
            ├── profile-{uid}-{timestamp}.jpg  ← Histórico
            └── ...

Firestore
└── users/
    └── {uid}/
        ├── name: "Juan Pérez"
        ├── email: "juan@example.com"
        ├── avatarUrl: "https://firebasestorage.../profile-{uid}-{timestamp}.jpg"
        └── createdAt: timestamp
```

## 🔐 Seguridad Requerida

### Firebase Storage Rules
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

### Firestore Rules
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

## 📊 Flujo de Carga

```
Usuario presiona 📷
    ↓
Dialog: "¿Cambiar foto?"
    ↓
Solicitar permisos de galería
    ↓
Abrir picker (1:1, editable, 80% quality)
    ↓
Usuario selecciona y edita foto
    ↓
Dialog: "Subiendo imagen..." + ActivityIndicator
    ↓
Subir a Firebase Storage
    ↓
Obtener URL de descarga
    ↓
Eliminar foto anterior de Storage
    ↓
Actualizar avatarUrl en Firestore
    ↓
Refrescar perfil (refetch)
    ↓
Mostrar foto nueva en Avatar
    ↓
Dialog cierra automáticamente
```

## 🎨 Customización

### Cambiar Emoji del Botón
```typescript
// En UserHeader.tsx
<Button>🖼️</Button>  // En lugar de 📷
```

### Cambiar Calidad de Imagen
```typescript
// En hooks/useImagePicker.ts
quality: 0.6,  // Menor = menor tamaño, peor calidad
quality: 0.95, // Mayor = mayor tamaño, mejor calidad
```

### Cambiar Aspecto
```typescript
aspect: [4, 3],  // En lugar de [1, 1]
```

### Cambiar Tamaño de Avatar
```typescript
<Avatar.Image size={80} source={{ uri: ... }} />
```

## 📝 Configuración Requerida

### Android
Ya configurado automáticamente por expo-image-picker, pero se puede verificar en `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### iOS
Ya configurado automáticamente, pero en `Info.plist`:
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tu galería para cambiar tu foto de perfil</string>
```

## ✅ Checklist de Verificación

- [ ] `expo-image-picker` instalado: `npm list expo-image-picker`
- [ ] `lib/storage.ts` creado
- [ ] `hooks/useImagePicker.ts` creado
- [ ] `components/UserHeader.tsx` actualizado con botón 📷
- [ ] Firebase Storage Rules configuradas
- [ ] Firestore Rules configuradas
- [ ] Probar en device/emulator: presionar botón 📷
- [ ] Verificar foto en Firebase Console → Storage
- [ ] Verificar avatarUrl en Firebase Console → Firestore

## 🔗 Referencias

| Recurso | Ubicación |
|---------|-----------|
| Guía completa | [docs/profile-photo-guide.md](docs/profile-photo-guide.md) |
| Uso de hooks | [docs/hooks-usage-guide.md](docs/hooks-usage-guide.md) |
| Ejemplos | [docs/integration-examples.md](docs/integration-examples.md) |
| API Storage | [Firebase Docs](https://firebase.google.com/docs/storage) |
| Image Picker | [Expo Docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |

## 🐛 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Necesitamos permisos..." | Usuario debe ir a Configuración → Permisos |
| No se sube imagen | Verificar conexión de red y Firebase Storage Rules |
| Foto no actualiza | Verificar que refetch() se ejecuta correctamente |
| Error "Firebase not initialized" | Verificar google-services.json y GoogleService-Info.plist |
| Imagen está borrosa | Aumentar quality a 0.9 en useImagePicker |

## 🚀 Próximas Mejoras (Opcional)

1. **Múltiples fotos** - Galería de fotos del perfil
2. **Crop avanzado** - Usar librería especializada
3. **Filtros** - Aplicar filtros a la foto
4. **Compresión automática** - Generar thumbnails
5. **Análisis** - Estadísticas de cambios

---

**Para más detalles, consulta los docs en la carpeta `docs/`**
