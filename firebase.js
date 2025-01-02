// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5zCFbSbfvK7VADPISOc-BNikiU5OnybU",
  authDomain: "notes-taking-app-43181.firebaseapp.com",
  projectId: "notes-taking-app-43181",
  storageBucket: "notes-taking-app-43181.firebasestorage.app",
  messagingSenderId: "878597981845",
  appId: "1:878597981845:web:b58752ca1d5a52fbc8fd9c",
  measurementId: "G-3CMHDP8HJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);