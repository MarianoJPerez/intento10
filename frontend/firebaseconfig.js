
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// fijate tu configuracion de firebase tomi, no te pude exportar la accountservicekey
const firebaseConfig = {
  apiKey: "AIzaSyB2rw3drlCi8G79Xq2k4wqnfX2jNghniEg",
  authDomain: "infinity-7f3f1.firebaseapp.com",
  projectId: "infinity-7f3f1",
  storageBucket: "infinity-7f3f1.appspot.com",
  messagingSenderId: "826718959273",
  appId: "1:826718959273:web:2015dd32188cb4b6db5bb8"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);


console.log("Firebase Config:", firebaseConfig);

export { app, auth };
