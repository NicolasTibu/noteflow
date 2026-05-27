# 📝 NoteFlow - Aplicación Expo de Notas con React Native

NoteFlow es una aplicación móvil moderna para gestionar tres tipos de contenido: **Notas**, **Tareas** e **Ideas**. Construida con Expo, React Native, TypeScript y las mejores prácticas de desarrollo.

## ✨ Características

- **Tres tipos de contenido** distintos y visualmente diferenciados
  - 📝 **Notas**: Notas de texto con contenido completo
  - ✅ **Tareas**: Listas de checklist con progreso visual
  - 💡 **Ideas**: Notas rápidas con etiquetas y color personalizado

- **UI moderna** con React Native Paper y Material Design
- **Rendimiento optimizado** con FlashList para listas de 50+ items
- **Búsqueda global** en tiempo real en cada pestaña
- **Formularios validados** con Zod y manejo de errores
- **Estado persistente** con AsyncStorage + Zustand
- **Feedback táctil** con Expo Haptics
- **Animaciones fluidas** con React Native Reanimated
- **Tema oscuro/claro** automático basado en sistema
- **Sistema de archivo** para guardar items indefinidamente

## 🚀 Inicio rápido

### Requisitos
- Node.js 16+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`

### Instalación

```bash
git clone https://github.com/tu-usuario/noteflow.git
cd noteflow
npm install --legacy-peer-deps
```

### Desarrollo

```bash
npm start
```

Luego escanea el código QR con Expo Go en tu teléfono, o usa el emulador:
- iOS: Presiona `i`
- Android: Presiona `a`

## 📁 Estructura del proyecto

```
noteflow/
├── app/
│   ├── _layout.tsx                 # Layout raíz con providers
│   ├── index.tsx                   # Redirección al home
│   ├── nueva-note.tsx              # Modal para crear notas
│   └── (tabs)/
│       ├── _layout.tsx             # Configuración de tabs
│       ├── notas/
│       │   ├── index.tsx           # Listado de notas
│       │   └── [id].tsx            # Detalle de nota
│       ├── checklists/
│       │   ├── index.tsx           # Listado de tareas
│       │   └── [id].tsx            # Detalle de tarea
│       ├── ideas/
│       │   ├── index.tsx           # Listado de ideas
│       │   └── [id].tsx            # Detalle de idea
│       └── archivadas.tsx          # Items archivados
├── components/
│   ├── EmptyState.tsx              # Estado vacío reutilizable
│   └── items/
│       ├── NoteCard.tsx            # Tarjeta de nota
│       ├── ChecklistCard.tsx       # Tarjeta de tarea
│       └── IdeaCard.tsx            # Tarjeta de idea
├── constants/
│   ├── theme.ts                    # Tokens de diseño y temas
│   └── validationSchemas.ts        # Esquemas Zod
├── store/
│   └── notesStore.ts               # Estado global con Zustand
├── types/
│   └── index.ts                    # Tipos TypeScript
├── docs/
│   └── react-native-teoria.md      # Documentación técnica
├── package.json
├── app.json
└── tsconfig.json
```

## 🎨 Tecnologías

### Core
- **React Native**: Framework para desarrollo mobile
- **Expo**: Plataforma de desarrollo simplificada
- **TypeScript**: Tipado estático

### UI & Styling
- **React Native Paper**: Componentes Material Design
- **@expo/vector-icons**: Iconos vectoriales

### Gestión de estado
- **Zustand**: Estado global ligero
- **AsyncStorage**: Persistencia en dispositivo

### Validación & Formularios
- **Zod**: Validación de esquemas

### Rendimiento & Animaciones
- **FlashList**: Listas optimizadas
- **React Native Reanimated**: Animaciones fluidas
- **Expo Haptics**: Feedback táctil

### Routing
- **Expo Router**: Navegación basada en archivos

## 📱 Uso

### Crear contenido
Presiona el botón **"Nueva nota"**, **"Nueva tarea"** o **"Nueva idea"** en cada pestaña. Se abrirá un modal con validación en tiempo real.

### Buscar
Usa el input de búsqueda en la cabecera de cada pestaña para filtrar en tiempo real.

### Archivar
En el detalle de cualquier item, presiona **"Archivar"** para movearlo a la pestaña "Archivadas". Se requiere confirmación.

### Toggle items (Tareas)
En el detalle de una tarea, presiona el checkbox junto a cada item para marcarlo como completado.

## 🏗️ Arquitectura

### Estado Global (Zustand + AsyncStorage)
El store `useNotesStore` contiene:
- `notes`, `checklists`, `ideas` - Contenido activo
- `archivedNotes`, `archivedChecklists`, `archivedIdeas` - Contenido archivado
- Acciones para CRUD y archivo

### Validación (Zod)
Tres esquemas principales:
- `noteSchema` - Título + contenido
- `checklistNoteSchema` - Título + items
- `ideaNoteSchema` - Título + tags + color

### Temas (React Native Paper)
Dos temas completamente configurados:
- **Light**: Paleta clara con fondo blanco
- **Dark**: Paleta oscura con fondo oscuro
- Cambio automático según preferencia del sistema

## 🎯 Características técnicas destacadas

### FlashList para rendimiento
Todas las listas usan `FlashList` con `estimatedItemSize` preciso. Soporta 50+ items sin caída de FPS.

### Animaciones con Reanimated
- Entrada: `FadeInDown` en nuevos items
- Salida: `FadeOutLeft` al eliminar
- Configuradas para máximo rendimiento

### Feedback táctil
- `ImpactFeedbackStyle.Light` al archivar
- `NotificationFeedbackType.Success` al completar checklist

### KeyboardAvoidingView
Los formularios usan `behavior='padding'` en iOS y `behavior='height'` en Android para un UX óptimo.

## 📊 Persistencia

Todos los datos se guardan automáticamente en AsyncStorage bajo la clave `noteflow-storage`. Los datos persisten entre sesiones.

## 🔍 Validación

Los formularios validan en tiempo real usando Zod y muestran mensajes de error contextuales.

## 🌙 Tema automático

La app detecta automáticamente el tema del sistema y se adapta. El tema se aplica a:
- Colores de fondo y superficies
- Tipografía
- Iconos
- Componentes Paper

## 📚 Documentación adicional

Ver [docs/react-native-teoria.md](./docs/react-native-teoria.md) para:
- Diferencias entre React Native y apps nativas
- Metro bundler y Expo Go
- Gestión de estado (useState vs Context vs Zustand)
- Navegación (Tabs, Stack, Modales)
- Rendimiento en listas (FlatList vs FlashList)
- Modelado de datos con TypeScript

## 🧪 Testing

Para auditar rendimiento en simulador:
- Crea 50+ items en cada lista
- Verifica que el scroll sea fluido sin caída de FPS
- Prueba en tema oscuro y claro
- Valida que las animaciones sean suaves

## 🚢 Despliegue

### Build para producción
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Ambas plataformas
eas build
```

## 📄 Licencia

MIT

## 👨‍💻 Autor

NoteFlow fue creado como una demostración de mejores prácticas en desarrollo Expo/React Native.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue o PR.

---

**Hecho con ❤️ usando Expo y React Native**
