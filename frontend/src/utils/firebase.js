// Configuración e inicialización de Firebase para Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANTE: Reemplaza los valores de firebaseConfig con los de tu proyecto de Firebase para que la integración funcione correctamente.
// Puedes obtenerlos en la consola de Firebase > Configuración del proyecto.
const firebaseConfig = {
    apiKey: "AIzaSyA_JzipzHCT9LzHZLrVZfQphmZ7Uz_v8Pk",
    authDomain: "scrapping-bd.firebaseapp.com",
    projectId: "scrapping-bd",
    storageBucket: "scrapping-bd.firebasestorage.app",
    messagingSenderId: "1050038285646",
    appId: "1:1050038285646:web:1ae874e294a3c38b3c5a1f",
    measurementId: "G-Y0R0ZW6D9H"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 