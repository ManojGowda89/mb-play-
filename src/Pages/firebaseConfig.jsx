// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDvZ0EuXel7mUTuHEFhIU-J6eEjEmqkphU",
  authDomain: "projects-4f71b.firebaseapp.com",
  projectId: "projects-4f71b",
  storageBucket: "projects-4f71b.appspot.com",
  messagingSenderId: "377153325064",
  appId: "1:377153325064:web:1dfd06db8b2a832a2e69bd",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
