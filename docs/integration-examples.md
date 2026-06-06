# Ejemplos de Integración

## Integrar UserHeader en una Pantalla

### Opción 1: En un Drawer Navigator

```typescript
// app/(tabs)/_layout.tsx (si usas drawer)
import { UserHeader } from '../../components/UserHeader';

export function DrawerContent() {
  return (
    <DrawerContentScrollView>
      <UserHeader showActions={true} showChangePhoto={true} />
      {/* resto del contenido */}
    </DrawerContentScrollView>
  );
}
```

### Opción 2: Como Encabezado en una Pantalla

```typescript
// app/(tabs)/settings.tsx
import { ScrollView, View } from 'react-native';
import { UserHeader } from '../../components/UserHeader';

export default function SettingsScreen() {
  return (
    <ScrollView>
      <UserHeader showActions={true} showChangePhoto={true} />
      {/* resto del contenido */}
    </ScrollView>
  );
}
```

### Opción 3: Sin Botón de Cambiar Foto

```typescript
<UserHeader showActions={true} showChangePhoto={false} />
```

### Opción 4: Solo Avatar

```typescript
<UserHeader showActions={false} showChangePhoto={false} />
```

## Crear Pantalla de Perfil Completa

### archivo: app/(tabs)/profile.tsx

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text as PaperText, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useUserProfile, useUpdateProfile } from '../../hooks';
import { UserHeader } from '../../components/UserHeader';

export default function ProfileScreen() {
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const { updateProfile } = useUpdateProfile();
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (profile?.name) {
      setEditedName(profile.name);
    }
  }, [profile?.name]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile({ name: editedName });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <UserHeader showActions={false} showChangePhoto={true} />
      
      <View style={styles.content}>
        <PaperText variant="headlineSmall">Editar perfil</PaperText>
        
        <TextInput
          label="Nombre"
          value={editedName}
          onChangeText={setEditedName}
          style={styles.input}
          editable={!isSaving}
        />
        
        <Button
          mode="contained"
          onPress={handleSaveProfile}
          loading={isSaving}
          disabled={isSaving}
          style={styles.button}
        >
          Guardar cambios
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  input: { marginVertical: 8 },
  button: { marginTop: 16 },
});
```

## Agregar Pantalla a las Tabs

### Opción: Modificar app/(tabs)/_layout.tsx

```typescript
<Tabs.Screen
  name="profile"
  options={{
    title: 'Perfil',
    tabBarIcon: ({ color, focused }) => (
      <TabBarIcon name={focused ? 'account' : 'account-outline'} color={color} />
    ),
  }}
/>
```

Luego crear: `app/(tabs)/profile.tsx`

## Ejemplo: Logout desde Cualquier Pantalla

```typescript
import { useRouter } from 'expo-router';
import { useLogout } from '../hooks';

export function SettingsButton() {
  const { logout } = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      mode="outlined"
      textColor="red"
      onPress={handleLogout}
    >
      Cerrar sesión
    </Button>
  );
}
```

## Ejemplo: Verificar Usuario Antes de Mostrar Contenido

```typescript
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View } from 'react-native';

export function ProtectedComponent() {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <Text>No autenticado</Text>;
  }

  return <Text>Usuario: {user.email}</Text>;
}
```

## Ejemplo: Mostrar Avatar del Usuario

```typescript
import { useUserProfile } from '../hooks';
import { Avatar } from 'react-native-paper';

export function UserAvatar() {
  const { profile } = useUserProfile();

  const initials = profile?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return profile?.avatarUrl ? (
    <Avatar.Image size={56} source={{ uri: profile.avatarUrl }} />
  ) : (
    <Avatar.Text size={56} label={initials} />
  );
}
```

## Ejemplo: Cambiar Foto de Perfil (Uso del Hook)

```typescript
import { useImagePicker } from '../hooks';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useState } from 'react';
import { View } from 'react-native';

export function ChangePhotoButton() {
  const { pickAndUploadImage, isLoading, error } = useImagePicker();
  const [showDialog, setShowDialog] = useState(false);

  const handleChangePhoto = async () => {
    try {
      await pickAndUploadImage();
      setShowDialog(false);
      alert('¡Foto actualizada!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button
        mode="contained"
        onPress={() => setShowDialog(true)}
        disabled={isLoading}
      >
        Cambiar Foto de Perfil
      </Button>

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Cambiar Foto</Dialog.Title>
          <Dialog.Content>
            {error && <Text style={{ color: 'red' }}>{error}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancelar</Button>
            <Button 
              onPress={handleChangePhoto}
              loading={isLoading}
              disabled={isLoading}
            >
              Seleccionar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
```

## Ejemplo: Formulario de Cambio de Contraseña

```typescript
import { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { TextInput, Button, Text } from 'react-native-paper';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    try {
      const user = auth().currentUser;
      if (!user?.email) return;

      // Re-autenticar
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await user.reauthenticateWithCredential(credential);

      // Cambiar contraseña
      await user.updatePassword(newPassword);
      alert('Contraseña cambiada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <View>
      <TextInput
        label="Contraseña actual"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        label="Nueva contraseña"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button onPress={handleChangePassword}>
        Cambiar contraseña
      </Button>
    </View>
  );
}
```

## Ejemplo: Adjuntar Imagen a una Nota

```typescript
import { useImagePicker } from '../hooks';
import { Button, Card, Image } from 'react-native-paper';
import { useState } from 'react';
import { View } from 'react-native';

export function NoteWithImage() {
  const { pickAndUploadImage, isLoading } = useImagePicker();
  const [imageUri, setImageUri] = useState<string | null>(null);

  // NOTA: Este es un ejemplo. Para adjuntar a notas necesitarías:
  // 1. Crear un documento en /notes/{noteId}/attachments/{imageId}
  // 2. Usar uploadProfileImage pero con path diferente
  // 3. Almacenar URI en el documento de la nota

  return (
    <View>
      <Button
        mode="outlined"
        onPress={async () => {
          try {
            await pickAndUploadImage();
            // Aquí tendrías que guardar la URL en tu nota
          } catch (error) {
            console.error(error);
          }
        }}
        loading={isLoading}
      >
        Adjuntar Foto
      </Button>

      {imageUri && (
        <Card>
          <Card.Cover source={{ uri: imageUri }} />
        </Card>
      )}
    </View>
  );
}
```
