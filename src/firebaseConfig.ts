// firebaseConfig.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "API KEY ACAAA",
    authDomain: "sayc-firebase01.firebaseapp.com",
    projectId: "sayc-firebase01",
    storageBucket: "sayc-firebase01.appspot.com",
    messagingSenderId: "810066404861",
    appId: "1:810066404861:web:ebc09cfd2afb4dea0a2594",
    measurementId: "G-PJP61SEZVK"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Obtén una instancia de Firestore
const firestore = firebase.firestore();

export default firestore;