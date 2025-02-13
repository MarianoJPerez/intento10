// frontend/firebaseConfig.js
import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB2rw3drlCi8G79Xq2k4wqnfX2jNghniEg",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "infinity-7f3f1",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "826718959273",
  appId: "826718959273"
};

// Inicializa Firebase solo si no se ha inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;