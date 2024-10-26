// firebase-config.js

// Importer les fonctions nécessaires de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAyk8bXkga9trYpjnLsSGV5RVjLyIH6HIs",
  authDomain: "challenge-21-5dc3b.firebaseapp.com",
  projectId: "challenge-21-5dc3b",
  storageBucket: "challenge-21-5dc3b.appspot.com",
  messagingSenderId: "1055997037321",
  appId: "1:1055997037321:web:64e2b003c74ee516ef61d8",
  measurementId: "G-1YPYR46K7N"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Exporter les instances pour les utiliser dans d'autres fichiers
export { app, auth, firestore };
