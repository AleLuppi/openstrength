// Import the required functions from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Other SDKs for Firebase products at following link
// https://firebase.google.com/docs/web/setup#available-libraries

// Web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQMm4d1r323z3uq_sAxVTqh9M49gicngw",
  authDomain: "openstrength.firebaseapp.com",
  projectId: "openstrength",
  storageBucket: "openstrength.appspot.com",
  messagingSenderId: "512957046617",
  appId: "1:512957046617:web:72b3115ebab7d33a217648",
  measurementId: "G-XB71BH7FWM",
};

/* ----- Initialization ----- */
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;

// Initialize Analytics and get a reference to the service
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
