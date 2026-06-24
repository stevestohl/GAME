import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNdILTfCB5RZZz20LxhOUMyx0mxIXEHAE",
  authDomain: "tictactoe-multiplayer-2a001.firebaseapp.com",
  projectId: "tictactoe-multiplayer-2a001",
  storageBucket: "tictactoe-multiplayer-2a001.firebasestorage.app",
  messagingSenderId: "564352114227",
  appId: "1:564352114227:web:9e14a2d3daa0c7f81d0d46",
  measurementId: "G-9QWNVFC0PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app)