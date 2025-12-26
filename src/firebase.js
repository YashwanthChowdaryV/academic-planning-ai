import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNw-IzIfNSs2hXKnU4_Jh3kqSEUYAupZA",
  authDomain: "aiagent-a0a84.firebaseapp.com",
  projectId: "aiagent-a0a84",
  storageBucket: "aiagent-a0a84.firebasestorage.app",
  messagingSenderId: "52178677620",
  appId: "1:52178677620:web:d742a5fd4112211880c621",
  measurementId: "G-6ECXBEG4ED"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
