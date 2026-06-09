import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCIJABSYWJvDsr94ghtKcztsvbOEdQqHas",
  authDomain: "pocket-heist-app-egcgt3.firebaseapp.com",
  projectId: "pocket-heist-app-egcgt3",
  storageBucket: "pocket-heist-app-egcgt3.firebasestorage.app",
  messagingSenderId: "742242889565",
  appId: "1:742242889565:web:5abd6305a913ad6dcc82b4",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
