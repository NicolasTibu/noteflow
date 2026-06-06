let auth: any;
let firestore: any;

// Detectar si la app corre bajo el entorno de Expo Go
let isExpoGo = false;
try {
  const Constants = require('expo-constants');
  const appOwnership = Constants && (Constants.default || Constants).appOwnership;
  if (appOwnership === 'expo') {
    isExpoGo = true;
  }
} catch (e) {
  // expo-constants no disponible
}

// Credenciales para la inicialización explícita en JS (si el puente nativo la requiere)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

if (isExpoGo) {
  const mocks = require('./firebase-mock');
  // Se ejecuta la función del mock para obtener la instancia del objeto simulación
  auth = mocks.createAuthMock();
  firestore = mocks.createFirestoreMock();
  console.warn('Expo Go detectado — usando mocks de Firebase para desarrollo.');
} else {
  try {
    const firebaseApp = require('@react-native-firebase/app').default;
    
    if (firebaseApp && firebaseApp.apps.length === 0) {
      firebaseApp.initializeApp(firebaseConfig);
    }
    
    // CORRECCIÓN: Se remueven los paréntesis () finales para asignar las instancias nativas correctamente
    auth = require('@react-native-firebase/auth').default;
    firestore = require('@react-native-firebase/firestore').default;
    
    console.log("¡Firebase Nativo cargado con éxito!");
  } catch (e) {
    const mocks = require('./firebase-mock');
    auth = mocks.createAuthMock();
    firestore = mocks.createFirestoreMock();
    console.warn('Carga nativa fallida — usando mocks de contingencia.', e);
  }
}

export { auth, firestore };