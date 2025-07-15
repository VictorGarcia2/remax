// Configuración e inicialización de Firebase para Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANTE: Reemplaza los valores de firebaseConfig con los de tu proyecto de Firebase para que la integración funcione correctamente.
// Puedes obtenerlos en la consola de Firebase > Configuración del proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyBvNfyPiw50Y94B5rN-I_tUwdWz7iR_i8M",
  authDomain: "bdlamudi.firebaseapp.com",
  projectId: "bdlamudi",
  storageBucket: "bdlamudi.firebasestorage.app",
  messagingSenderId: "455649229694",
  appId: "1:455649229694:web:5cdb1bd511ee75c0dc912f",
  measurementId: "G-P2CPXCGCYQ"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 