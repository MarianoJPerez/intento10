import { auth } from "../../firebaseconfig"; 
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/styleslogin.css";

const LoginWithCarouselAPI = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate(); // <-- Aquí se inicializa

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Forzamos la actualización del token para obtener las custom claims
        const tokenResult = await user.getIdTokenResult(true);
        console.log(" Token claims:", tokenResult.claims);
      } else {
        console.log(" No hay usuario autenticado.");
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
        console.log(" Token claims actualizadas:", tokenResult.claims);
        const role = tokenResult.claims.role || "user";

// Construir el objeto userData con la información necesaria
const userData = {
  email: user.email,
  // Usa displayName si existe, o extrae el nombre del email
  username: user.displayName || user.email.split("@")[0],
  role: role,
  balance: 500, // Puedes asignar el balance que manejes o traerlo desde otra fuente
};

// Enviamos el token (actualizado) al backend para validar y obtener más datos si es necesario

await axios.post("http://localhost:3000/api/login", { idToken: tokenResult.token });

// Guarda los datos de usuario en el estado global
setCurrentUser(userData);

console.log("Login exitoso, cookie de sesión creada.");

// Redirige usando navigate para respetar el basename
if (role === "admin") {
  navigate("/admin");
} else {
  navigate("/");
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
