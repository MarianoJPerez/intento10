import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../assets/admin.css";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        if (token.claims.role !== "admin") {
          navigate("/");
        } else {
          fetchUsers();
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchUsers = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch("http://localhost:3000/api/users", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  // Función actualizada para enviar mensajes, usando el uid del usuario
  const handleSendMessage = async (uid) => {
    const message = prompt("Ingrese el mensaje para el usuario:");
    if (message) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch("http://localhost:3000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ uid, message }),
        });
        if (response.ok) {
          alert("Mensaje enviado correctamente");
        } else {
          alert("Error al enviar el mensaje");
        }
      } catch (error) {
        console.error("Error enviando mensaje:", error);
      }
    }
  };

  const handleDeleteUser = async (uid) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      await fetch(`http://localhost:3000/api/users/${uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setUsers(users.filter(user => user.uid !== uid));
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Panel de Administrador</h2>
      <div className="nav-buttons">
    
        <button 
          onClick={() => navigate("/admin/apigames")} 
          className="games-management-button"
        >
          Gestión de Juegos
        </button>
      </div>
      
      <ul className="admin-users">
        {users.map(user => (
          <li key={user.uid}>
            <span>{user.email}</span>
            <div className="btn-group">
              <button onClick={() => handleDeleteUser(user.uid)}>
                Eliminar
              </button>
              {/* Ahora se envía el uid en lugar del email */}
              <button onClick={() => handleSendMessage(user.uid)}>
                Enviar Mensaje
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
