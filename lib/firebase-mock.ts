import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Configuración real. ¡Asegúrate de copiar estos datos desde tu consola de Firebase!
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// 2. Inicialización segura (evita errores si el código se recarga)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 3. Auth con persistencia (esto hace que no tengas que loguearte cada vez que abras la app)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 4. Base de datos
const firestore = getFirestore(app);

export { auth, firestore };