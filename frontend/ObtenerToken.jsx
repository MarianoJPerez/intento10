import { getAuth } from "firebase/auth";
import { useEffect } from "react";

function ObtenerToken() {
  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        console.log("Tu ID Token:", token);
      } else {
        console.log(" No hay usuario autenticado.");
      }
    });
  }, []);

  return null; 
}

export default ObtenerToken;
