import { auth } from "../../firebaseconfig"; 
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import "../assets/styleslogin.css";

const LoginWithCarouselAPI = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Forzamos la actualización del token para obtener las custom claims
        const tokenResult = await user.getIdTokenResult(true);
        console.log("✅ Token claims:", tokenResult.claims);
      } else {
        console.log("❌ No hay usuario autenticado.");
      }
    });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        await axios.post("http://localhost:3000/api/register", { idToken });

        alert("Registro exitoso, ahora puedes iniciar sesión.");
        setIsRegistering(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Forzamos la actualización del token para que incluya las custom claims (como role)
        const tokenResult = await user.getIdTokenResult(true);
        console.log("✅ Token claims actualizadas:", tokenResult.claims);
        const role = tokenResult.claims.role || "user";

        // Enviamos el token (actualizado) al backend para validar y obtener más datos si es necesario
        const response = await axios.post("http://localhost:3000/api/login", { idToken: tokenResult.token });
        // Incluimos el role obtenido directamente del token
        setCurrentUser({ ...response.data, role });

        console.log("Login exitoso, cookie de sesión creada.");

        if (role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("Código de error:", error.code);
      console.error("Mensaje de error:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="login-page">
      <div className="banner"></div>

      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">{isRegistering ? "Registrarse" : "Iniciar Sesión"}</h2>
          <form onSubmit={handleAuth} className="login-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>
            <button type="submit" className="login-button">
              {isRegistering ? "Registrarse" : "Iniciar Sesión"}
            </button>
          </form>
          <p className="switch-auth">
            {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <button onClick={() => setIsRegistering(!isRegistering)} className="toggle-auth">
              {isRegistering ? "Inicia sesión" : "Regístrate"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginWithCarouselAPI;
