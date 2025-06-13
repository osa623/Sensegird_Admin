import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyANIscHk12Dwz3FbW7_wg4Y9EnVlnB6Juo",
  authDomain: "sensegrid-9d9e0.firebaseapp.com",
  projectId: "sensegrid-9d9e0",
  storageBucket: "sensegrid-9d9e0.firebasestorage.app",
  messagingSenderId: "636111966842",
  appId: "1:636111966842:web:664e24258ed7d5f06fa1c3",
  measurementId: "G-FPFVGKJ6BN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
