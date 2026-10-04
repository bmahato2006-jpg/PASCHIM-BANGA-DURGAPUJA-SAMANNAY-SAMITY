// Firebase Configuration for Durgapur Durga Puja Pandal Voting Platform
// Replace the placeholder values below with your real Firebase Project credentials.
// You can obtain these from the Firebase Console (Project Settings > General > Your apps > SDK setup and configuration).

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCJMNMq-r_ZpNfV7mZSdyCbShH_8wzpBzY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "durgapur-puja-voting.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "durgapur-puja-voting",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "durgapur-puja-voting.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1029384756:web:a1b2c3d4e5f6g7h8",
};

export default firebaseConfig;
