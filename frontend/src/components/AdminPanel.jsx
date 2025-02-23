import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const token = await auth.currentUser.getIdTokenResult();
      if (token.claims.role !== "admin") {
        navigate("/"); // Redirigir si no es admin
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users", {
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          },
        });
        setUsers(await response.json());
      } catch (error) {
        console.error("Error obteniendo usuarios:", error);
      }
    };

    checkAdmin();
    fetchUsers();
  }, [auth, navigate]);

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
      });
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  const handleSendMessage = (userEmail) => {
    const message = prompt("Ingrese el mensaje para el usuario:");
    if (message) {
      console.log(`Mensaje enviado a ${userEmail}: ${message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Panel de Administrador</h2>
      <button onClick={() => signOut(auth)} className="bg-red-500 px-4 py-2 rounded mb-4">
        Cerrar sesión
      </button>
      <ul>
        {users.map(user => (
          <li key={user.id} className="mb-2 p-2 bg-gray-700 rounded flex justify-between">
            <span>{user.email}</span>
            <div>
              <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 px-2 py-1 rounded mr-2">
                Eliminar
              </button>
              <button onClick={() => handleSendMessage(user.email)} className="bg-blue-500 px-2 py-1 rounded">
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
