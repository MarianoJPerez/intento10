import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        console.log("Token claims:", tokenResult.claims); // ⚠️ Verifica que tenga "role: admin" en consola
  
        const role = tokenResult.claims.role || "user";
        setUserRole(role);
  
        // ✅ Guarda el usuario en localStorage con el rol correcto
        const userData = {
          email: user.email,
          username: user.email.split("@")[0], // Usa el email como username si no hay uno definido
          role: role,
        };
  
        localStorage.setItem("currentUser", JSON.stringify(userData));
  
        // ✅ Redirige correctamente según el rol
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    });
  }, [auth, navigate]);
  
  

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Error en autenticación:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">{isRegistering ? "Registro" : "Login"}</h1>
      <form onSubmit={handleAuth} className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-4 rounded" required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 rounded" required />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded w-full">
          {isRegistering ? "Registrarse" : "Iniciar Sesión"}
        </button>
      </form>
      <p className="mt-4">
        {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
        <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-400 underline">
          {isRegistering ? "Inicia sesión" : "Regístrate"}
        </button>
      </p>
    </div>
  );
};

export default Auth;
