// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOeKgwQMC2bphKFDWl3OqrL1tL-czYsos",
  authDomain: "financetrack-dd1fb.firebaseapp.com",
  projectId: "financetrack-dd1fb",
  storageBucket: "financetrack-dd1fb.firebasestorage.app",
  messagingSenderId: "185648301110",
  appId: "1:185648301110:web:540df92fa92700d591c497",
  measurementId: "G-Z5JKCTV2SB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
