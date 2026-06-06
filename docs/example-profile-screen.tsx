import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text as PaperText, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useUserProfile, useUpdateProfile } from '../hooks';

/**
 * Ejemplo de pantalla de perfil que usa los hooks y utilidades de autenticación
 * 
 * Puedes crear una pantalla similar en app/(tabs)/profile.tsx
 */

export function ExampleProfileScreen() {
  const { profile, isLoading: isLoadingProfile, error: profileError } = useUserProfile();
  const { updateProfile, isAuthenticated } = useUpdateProfile();
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Inicializar nombre cuando se carga el perfil
  React.useEffect(() => {
    if (profile?.name) {
      setEditedName(profile.name);
    }
  }, [profile?.name]);

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      setSaveError('El nombre no puede estar vacío');
      return;
    }

    if (!isAuthenticated) {
      setSaveError('No estás autenticado');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await updateProfile({ name: editedName });
      // El perfil se actualizará automáticamente
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Error al guardar perfil'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.centerContainer}>
        <PaperText style={styles.error}>{profileError}</PaperText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <PaperText variant="headlineSmall" style={styles.title}>
          Mi Perfil
        </PaperText>

        {/* Email (solo lectura) */}
        <PaperText variant="labelMedium" style={styles.label}>
          Correo electrónico
        </PaperText>
        <View style={styles.readOnlyInput}>
          <PaperText>{profile?.email}</PaperText>
        </View>

        {/* Nombre (editable) */}
        <TextInput
          label="Nombre"
          value={editedName}
          onChangeText={setEditedName}
          style={styles.input}
          editable={!isSaving}
        />

        {/* Mensaje de error */}
        {saveError && (
          <PaperText style={styles.error}>{saveError}</PaperText>
        )}

        {/* Botones de acción */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSaveProfile}
            loading={isSaving}
            disabled={isSaving || editedName === profile?.name}
          >
            Guardar cambios
          </Button>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <PaperText variant="labelSmall">
            Cuenta creada el{' '}
            {profile?.createdAt
              ? new Date(profile.createdAt.toDate()).toLocaleDateString('es-ES')
              : 'N/A'}
          </PaperText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  readOnlyInput: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    marginVertical: 8,
  },
  actions: {
    marginTop: 24,
    gap: 8,
  },
  infoSection: {
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  error: {
    color: '#B00020',
    marginTop: 8,
  },
});
