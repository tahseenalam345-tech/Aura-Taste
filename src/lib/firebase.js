import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDHbDUBcnXIUmrmiZFdD8ZfV-wOUb9MFnw",
  authDomain: "aura-taste-app.firebaseapp.com",
  projectId: "aura-taste-app",
  storageBucket: "aura-taste-app.firebasestorage.app",
  messagingSenderId: "166660042182",
  appId: "1:166660042182:web:abb45aec88e8c8a52516c7"
};

// FIX: Added 'export' keyword here so other files can use 'app'
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);