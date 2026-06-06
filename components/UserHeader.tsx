import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Avatar,
  Text as PaperText,
  Divider,
  Dialog,
  Portal,
  ActivityIndicator,
} from 'react-native-paper';
import { CachedRemoteImage } from './CachedRemoteImage';
import { useUserProfile, useLogout, useImagePicker } from '../hooks';
import { useAuthStore } from '../store/authStore';

interface UserHeaderProps {
  showActions?: boolean;
  showChangePhoto?: boolean;
  showProfileDetails?: boolean;
}

export function UserHeader({
  showActions = true,
  showChangePhoto = true,
  showProfileDetails = false,
}: UserHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const { profile, isLoading } = useUserProfile();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const { pickAndUploadImage, isLoading: isUploadingImage, error: uploadError } =
    useImagePicker();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showChangePhotoDialog, setShowChangePhotoDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleChangePhoto = async (source: 'camera' | 'library') => {
    try {
      await pickAndUploadImage(source);
      setShowChangePhotoDialog(false);
    } catch (error) {
      console.error('Error al cambiar foto:', error);
    }
  };

  if (!user) {
    return null;
  }

  const avatarColor = profile?.avatarUrl ? undefined : '#6200ee';
  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const showCompactActions = showActions && !showProfileDetails;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          {showCompactActions && (
            <Button
              mode="text"
              textColor="#B00020"
              onPress={() => setShowLogoutDialog(true)}
              loading={isLoggingOut}
              disabled={isLoading || isLoggingOut || isUploadingImage}
              style={styles.logoutButton}
            >
              Cerrar sesión
            </Button>
          )}

          {/* Avatar Container con Botón Flotante */}
          <View style={styles.avatarContainer}>
            {profile?.avatarUrl ? (
              <CachedRemoteImage
                uri={profile.avatarUrl}
                style={styles.avatarImage}
                placeholderStyle={styles.avatarPlaceholder}
              />
            ) : (
              <Avatar.Text size={56} label={initials} color={avatarColor} />
            )}
            {showChangePhoto && (
              <Button
                mode="contained-tonal"
                size="small"
                onPress={() => setShowChangePhotoDialog(true)}
                disabled={isUploadingImage || isLoggingOut}
                style={styles.changePhotoButton}
              >
                📷
              </Button>
            )}
          </View>

          {showProfileDetails ? (
            <View style={styles.userInfo}>
              <PaperText variant="titleMedium" numberOfLines={1}>
                {profile?.name || 'Usuario'}
              </PaperText>
              <PaperText variant="bodySmall" numberOfLines={1}>
                {profile?.email || user.email}
              </PaperText>
              {uploadError && (
                <PaperText style={styles.error} numberOfLines={2}>
                  {uploadError}
                </PaperText>
              )}
            </View>
          ) : null}
        </View>

        {showActions && showProfileDetails && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.actions}>
              <Button
                mode="text"
                textColor="#B00020"
                onPress={() => setShowLogoutDialog(true)}
                loading={isLoggingOut}
                disabled={isLoading || isLoggingOut || isUploadingImage}
              >
                Cerrar sesión
              </Button>
            </View>
          </>
        )}
      </View>

      {/* Dialog: Cambiar Foto */}
      <Portal>
        <Dialog
          visible={showChangePhotoDialog}
          onDismiss={() => setShowChangePhotoDialog(false)}
        >
          <Dialog.Title>Cambiar foto de perfil</Dialog.Title>
          <Dialog.Content>
            {isUploadingImage ? (
              <View style={styles.dialogCenter}>
                <ActivityIndicator size="large" />
                <PaperText style={styles.uploadingText}>Subiendo imagen...</PaperText>
              </View>
            ) : (
              <PaperText>Elige si quieres tomar una foto o seleccionar una imagen de la galería.</PaperText>
            )}
          </Dialog.Content>
          {!isUploadingImage && (
            <Dialog.Actions>
              <Button onPress={() => setShowChangePhotoDialog(false)}>
                Cancelar
              </Button>
              <Button
                onPress={() => handleChangePhoto('library')}
                disabled={isUploadingImage}
              >
                Galería
              </Button>
              <Button
                onPress={() => handleChangePhoto('camera')}
                disabled={isUploadingImage}
              >
                Cámara
              </Button>
            </Dialog.Actions>
          )}
        </Dialog>

        {/* Dialog: Logout */}
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
        >
          <Dialog.Title>Cerrar sesión</Dialog.Title>
          <Dialog.Content>
            <PaperText>¿Estás seguro de que quieres cerrar sesión?</PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>
              Cancelar
            </Button>
            <Button
              onPress={handleLogout}
              loading={isLoggingOut}
              disabled={isLoggingOut}
              textColor="#B00020"
            >
              Cerrar sesión
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
  },
  avatarPlaceholder: {
    backgroundColor: '#BDBDBD',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    padding: 0,
  },
  userInfo: {
    flex: 1,
  },
  error: {
    color: '#B00020',
    marginTop: 4,
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  logoutButton: {
    marginRight: 12,
    alignSelf: 'center',
  },
  dialogCenter: {
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    marginTop: 12,
  },
});
