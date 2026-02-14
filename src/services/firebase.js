// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyDDKTXO3KHOqstAjOYRTpKTufGoLckxcy4",
  authDomain: "login-suti.firebaseapp.com",
  databaseURL: "https://login-suti-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "login-suti",
  storageBucket: "login-suti.firebasestorage.app",
  messagingSenderId: "363075617631",
  appId: "1:363075617631:web:4d3869e132026a4c0b6cea"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;