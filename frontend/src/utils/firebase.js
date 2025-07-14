// Configuración e inicialización de Firebase para Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANTE: Reemplaza los valores de firebaseConfig con los de tu proyecto de Firebase para que la integración funcione correctamente.
// Puedes obtenerlos en la consola de Firebase > Configuración del proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyCwwxzZvaONmZOPGfaXwTfAc2tC1Ff0SLE",
  authDomain: "propiedades-lamudi.firebaseapp.com",
  projectId: "propiedades-lamudi",
  storageBucket: "propiedades-lamudi.firebasestorage.app",
  messagingSenderId: "343763380351",
  appId: "1:343763380351:web:43c2bda9256e759496b74a",
  measurementId: "G-WXRK8VDGTR"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 