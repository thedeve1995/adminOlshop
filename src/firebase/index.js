import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // Import module auth

const firebaseConfig = {
  apiKey: "AIzaSyBBGzFwfpd5vg50NDqydKmYWj57NNLXDcs",
  authDomain: "gurinvert.firebaseapp.com",
  projectId: "gurinvert",
  storageBucket: "gurinvert.appspot.com",
  messagingSenderId: "839051326604",
  appId: "1:839051326604:web:e2145284a9f4a6b6d937a9",
  measurementId: "G-SYDLHV3L7N"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // Get the auth instance

export {
  db,
  storage,
  auth,
};
