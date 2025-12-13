// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfpqdTlYHl32sAEQz-xLO9XFHtkdbXz88",
  authDomain: "bloodbankmain-78384.firebaseapp.com",
  projectId: "bloodbankmain-78384",
  storageBucket: "bloodbankmain-78384.firebasestorage.app",
  messagingSenderId: "1067688737106",
  appId: "1:1067688737106:web:553a950cfa863ebc1ce28b"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);
export default app;
