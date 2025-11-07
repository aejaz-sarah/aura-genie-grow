// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChntDi3fiwfISbguu6cpmPQrzBp1G9fAQ",
  authDomain: "genie-76492.firebaseapp.com",
  projectId: "genie-76492",
  storageBucket: "genie-76492.appspot.com",
  messagingSenderId: "420834808488",
  appId: "1:420834808488:web:9fe3ef1528af24b655689d",
  measurementId: "G-Y9E5VZ71WZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase app and other services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
