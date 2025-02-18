import React, { useState } from 'react';
import { auth } from '../../firebaseconfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import axios from 'axios';
import '../assets/styleslogin.css'; 


const LoginWithCarouselAPI = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
     
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      console.log("ID Token:", idToken);
  
      const response = await axios.post('http://localhost:3000/api/login', { idToken });
      setCurrentUser(response.data);
      
      console.log('Login exitoso, cookie de sesión creada.');
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
          <h2 className="login-title">Iniciar Sesión</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Usuario"
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
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
   
export default LoginWithCarouselAPI;
