
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyATJBIfHvCqPp6V5KMq8XFp_xXcpymd0tk",
  authDomain: "elevengo-1a239.firebaseapp.com",
  projectId: "elevengo-1a239",
  storageBucket: "elevengo-1a239.firebasestorage.app",
  messagingSenderId: "760435675942",
  appId: "1:760435675942:web:45decdf53e748f0bbda7e7",
  measurementId: "G-MG3VHGRRYV"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { auth, googleProvider, appleProvider };