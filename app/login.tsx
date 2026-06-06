import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, TextInput, Text as PaperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/notas');
    } catch {
      // El estado error se muestra automáticamente
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.page}
    >
      <View style={styles.container}>
        <PaperText variant="headlineMedium" style={styles.title}>
          Iniciar sesión
        </PaperText>
        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          style={styles.input}
        />
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
          style={styles.input}
        />
        {error ? <PaperText style={styles.error}>{error}</PaperText> : null}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading || !email || !password}
          style={styles.button}
        >
          Entrar
        </Button>
        <Button
          mode="text"
          onPress={() => router.push('/register')}
          disabled={isLoading}
        >
          Crear cuenta
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    padding: 24,
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  error: {
    color: '#B00020',
    marginBottom: 12,
  },
});
