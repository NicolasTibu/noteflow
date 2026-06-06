import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, TextInput, Text as PaperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      // Mostrar error en la interfaz
      return;
    }

    try {
      await register(email, password, name);
      router.replace('/notas');
    } catch {
      // El estado error se muestra automáticamente
    }
  };

  const isFormValid = name && email && password && confirmPassword && password === confirmPassword;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.page}
    >
      <View style={styles.container}>
        <PaperText variant="headlineMedium" style={styles.title}>
          Crear cuenta
        </PaperText>
        <TextInput
          label="Nombre completo"
          value={name}
          onChangeText={setName}
          editable={!isLoading}
          style={styles.input}
        />
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
        <TextInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!isLoading}
          style={styles.input}
        />
        {error ? <PaperText style={styles.error}>{error}</PaperText> : null}
        {password !== confirmPassword && confirmPassword ? (
          <PaperText style={styles.error}>Las contraseñas no coinciden</PaperText>
        ) : null}
        <Button
          mode="contained"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading || !isFormValid}
          style={styles.button}
        >
          Registrarme
        </Button>
        <Button
          mode="text"
          onPress={() => router.push('/login')}
          disabled={isLoading}
        >
          Ya tengo cuenta
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
