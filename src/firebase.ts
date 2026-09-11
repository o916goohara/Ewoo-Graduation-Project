import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWVbuY9s1q8QDDBk0ARnTlEuEMyB9M8mc",
  authDomain: "ewoo-22nd.firebaseapp.com",
  projectId: "ewoo-22nd",
  storageBucket: "ewoo-22nd.firebasestorage.app",
  messagingSenderId: "1039986088318",
  appId: "1:1039986088318:web:c0333a31a1b9635e55fb2f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);