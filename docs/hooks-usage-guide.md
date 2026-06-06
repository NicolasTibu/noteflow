# Guía de Uso - Hooks de Autenticación

## 🎣 Hooks Disponibles

### 1. `useUserProfile()`
Obtiene el perfil del usuario actual desde Firestore.

```typescript
import { useUserProfile } from '../hooks';

export function MyComponent() {
  const { profile, isLoading, error, refetch } = useUserProfile();

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      <Text>Nombre: {profile?.name}</Text>
      <Text>Email: {profile?.email}</Text>
      <Button onPress={refetch}>Actualizar</Button>
    </View>
  );
}
```

**Retorna:**
- `profile: UserProfile | null` - Datos del usuario
- `isLoading: boolean` - Está cargando
- `error: string | null` - Mensaje de error
- `refetch: () => Promise<void>` - Recargar manualmente

---

### 2. `useUpdateProfile()`
Actualiza datos del perfil en Firestore.

```typescript
import { useUpdateProfile } from '../hooks';

export function EditProfileScreen() {
  const { updateProfile, isAuthenticated } = useUpdateProfile();
  const [name, setName] = useState('');

  const handleSave = async () => {
    try {
      await updateProfile({
        name: name,
        avatarUrl: 'https://...',
      });
      alert('Perfil actualizado');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <View>
      <TextInput value={name} onChangeText={setName} />
      <Button onPress={handleSave}>Guardar</Button>
    </View>
  );
}
```

**Retorna:**
- `updateProfile: (data) => Promise<void>` - Función para actualizar
- `isAuthenticated: boolean` - Si hay usuario autenticado

**Campos actualizables:**
```typescript
{
  name?: string;
  email?: string;
  avatarUrl?: string | null;
}
```

---

### 3. `useLogout()`
Cierra la sesión del usuario.

```typescript
import { useLogout } from '../hooks';
import { useRouter } from 'expo-router';

export function SettingsScreen() {
  const { logout, isLoading } = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      alert('Error al cerrar sesión');
    }
  };

  return (
    <Button
      onPress={handleLogout}
      loading={isLoading}
      textColor="red"
    >
      Cerrar sesión
    </Button>
  );
}
```

**Retorna:**
- `logout: () => Promise<void>` - Función para cerrar sesión
- `isLoading: boolean` - Está procesando

---

### 4. `useImagePicker()` ✨ NUEVO
Selecciona una imagen de la galería, la sube a Firebase Storage y actualiza el perfil.

```typescript
import { useImagePicker } from '../hooks';

export function ChangePhotoButton() {
  const { pickAndUploadImage, isLoading, error } = useImagePicker();

  return (
    <View>
      <Button
        onPress={pickAndUploadImage}
        loading={isLoading}
        disabled={isLoading}
      >
        Cambiar foto
      </Button>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

**Retorna:**
- `pickAndUploadImage: () => Promise<void>` - Selecciona y sube imagen
- `isLoading: boolean` - Cargando
- `error: string | null` - Errores

**Características:**
- ✅ Solicita permisos de galería automáticamente
- ✅ Permite editar/cortar imagen (1:1)
- ✅ Sube a Firebase Storage
- ✅ Elimina foto anterior automáticamente
- ✅ Actualiza Firestore con nueva URL
- ✅ Refrescha el perfil en la UI

---

### 5. `useAuthStore()`
State management general de autenticación.

```typescript
import { useAuthStore } from '../store/authStore';

export function AuthStatus() {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View>
      <Text>Usuario: {user?.email}</Text>
      <Text>Inicializando: {isInitializing}</Text>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

**Estados:**
- `user: auth.User | null` - Usuario actual
- `isLoading: boolean` - Cargando
- `isInitializing: boolean` - Inicializando listeners
- `error: string | null` - Errores

**Funciones:**
```typescript
login(email: string, password: string): Promise<void>
register(email: string, password: string, name: string): Promise<void>
logout(): Promise<void>
initializeAuth(): void
```

---

## 📋 Casos de Uso Comunes

### Caso 1: Mostrar Datos del Usuario
```typescript
import { useUserProfile } from '../hooks';

export function ProfileCard() {
  const { profile } = useUserProfile();

  return (
    <Card>
      <Card.Title title={profile?.name} subtitle={profile?.email} />
      <Card.Cover source={{ uri: profile?.avatarUrl }} />
    </Card>
  );
}
```

### Caso 2: Formulario de Edición de Perfil
```typescript
import { useState } from 'react';
import { useUserProfile, useUpdateProfile } from '../hooks';

export function EditProfile() {
  const { profile } = useUserProfile();
  const { updateProfile } = useUpdateProfile();
  const [name, setName] = useState(profile?.name || '');

  const handleSave = async () => {
    await updateProfile({ name });
  };

  return (
    <View>
      <TextInput value={name} onChangeText={setName} />
      <Button onPress={handleSave}>Guardar</Button>
    </View>
  );
}
```

### Caso 3: Cambiar Foto de Perfil
```typescript
import { useImagePicker } from '../hooks';
import { Button } from 'react-native-paper';
import { useState } from 'react';
import { Dialog, Portal } from 'react-native-paper';

export function ChangePhotoScreen() {
  const { pickAndUploadImage, isLoading, error } = useImagePicker();
  const [showDialog, setShowDialog] = useState(false);

  const handleChange = async () => {
    try {
      await pickAndUploadImage();
      setShowDialog(false);
      alert('¡Foto actualizada!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <>
      <Button onPress={() => setShowDialog(true)}>
        Cambiar Foto
      </Button>

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Cambiar Foto</Dialog.Title>
          <Dialog.Content>
            {error && <Text style={{ color: 'red' }}>{error}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancelar</Button>
            <Button onPress={handleChange} loading={isLoading}>
              Seleccionar Foto
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
```

### Caso 4: Drawer con Usuario y Cambiar Foto
```typescript
import { useUserProfile, useImagePicker } from '../hooks';
import { UserHeader } from '../components/UserHeader';

export function DrawerContent() {
  return (
    <DrawerContentScrollView>
      {/* UserHeader ya incluye el botón de cambiar foto */}
      <UserHeader showActions={true} showChangePhoto={true} />
      
      <DrawerItemList />
    </DrawerContentScrollView>
  );
}
```

### Caso 5: Pantalla de Configuración
```typescript
import { useLogout } from '../hooks';

export function SettingsScreen() {
  const { logout } = useLogout();

  return (
    <ScrollView>
      <Section title="Cuenta">
        <Item>Cambiar email</Item>
        <Item>Cambiar contraseña</Item>
      </Section>
      
      <Section title="Seguridad">
        <Button
          onPress={logout}
          mode="outlined"
          textColor="red"
        >
          Cerrar sesión
        </Button>
      </Section>
    </ScrollView>
  );
}
```

---

## ⚠️ Notas Importantes

1. **`useUserProfile` depende de usuario autenticado**
   ```typescript
   // Esto funcionará solo si hay usuario
   const { profile } = useUserProfile();
   // Si no hay usuario, profile será null
   ```

2. **Errores de Firebase**
   ```typescript
   // Los errores son capturados automáticamente
   try {
     await logout();
   } catch (error) {
     // error.message contiene el error de Firebase
     console.log(error.message);
   }
   ```

3. **Sincronización de Estado**
   ```typescript
   // Cualquier actualización en Firestore se refleja automáticamente
   await updateProfile({ name: 'Nuevo Nombre' });
   // useUserProfile() se actualizará automáticamente
   ```

4. **Performance**
   ```typescript
   // Usa selectores de Zustand para evitar re-renders innecesarios
   const user = useAuthStore((state) => state.user);
   // En lugar de
   const { user } = useAuthStore(); // ❌ Re-render en cualquier cambio
   ```

---

## 🔗 Importaciones Rápidas

```typescript
// Opción 1: Importar de hooks/index.ts
import { useUserProfile, useUpdateProfile, useLogout } from '../hooks';

// Opción 2: Importar del archivo específico
import { useUserProfile } from '../hooks/useUserProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useLogout } from '../hooks/useLogout';

// Estado global
import { useAuthStore } from '../store/authStore';

// Componentes
import { UserHeader } from '../components/UserHeader';
```
