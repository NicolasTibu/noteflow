import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Provider as PaperProvider } from 'react-native-paper';
import { useNoteFlowTheme } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  console.log('--- Renderizando RootLayoutNav ---');
  const theme = useNoteFlowTheme();
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const [fontsLoaded, fontError] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  console.log('Estado:', { fontsLoaded, fontError, isInitializing, hasUser: !!user, segments });

  // Inicializar listeners de autenticación
  useEffect(() => {
    console.log('Iniciando initializeAuth...');
    let unsubscribe: any;
    try {
      unsubscribe = initializeAuth();
    } catch (e) {
      console.error('Error al inicializar auth:', e);
    }
    return () => {
      console.log('Limpiando initializeAuth');
      unsubscribe?.();
    };
  }, [initializeAuth]);

  // Efectuar el enrutamiento basado en el estado de autenticación
  useEffect(() => {
    if (isInitializing) {
      console.log('Esperando a que termine la inicialización de Auth...');
      return;
    }

    const isAuthScreen = segments[0] === 'login' || segments[0] === 'register';
    console.log('Verificando ruta:', { isAuthScreen, path: segments[0] });

    if (user && isAuthScreen) {
      console.log('Redirigiendo a Notas (Usuario detectado)');
      router.replace('/notas');
    } else if (!user && !isAuthScreen) {
      console.log('Redirigiendo a Login (No hay usuario)');
      router.replace('/login');
    }
  }, [user, segments, isInitializing]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('Ocultando Splash Screen');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const showLoadingOverlay = isInitializing || (!fontsLoaded && !fontError);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Slot />
      {showLoadingOverlay ? (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : null}
    </PaperProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
