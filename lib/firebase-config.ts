import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZjKtPHNmRjlRbqugD2jVFyXO4vRhx82A",
  authDomain: "e-bosch.firebaseapp.com",
  projectId: "e-bosch",
  storageBucket: "e-bosch.firebasestorage.app",
  messagingSenderId: "451067614750",
  appId: "1:451067614750:web:b88cce65a07892ff6bc00f",
  measurementId: "G-DF4TR3G0L2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
