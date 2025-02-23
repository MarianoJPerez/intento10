import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ApiGames = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [editingGame, setEditingGame] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        console.log("Token claims:", tokenResult.claims);
        if (tokenResult.claims.role !== "admin") {
          navigate("/");
        } else {
          fetchGames();
        }
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchGames = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/games");
      setGames(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener juegos:", error);
      setLoading(false);
    }
  };

  const getAuthHeader = async () => {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      return { Authorization: `Bearer ${idToken}` };
    }
    return {};
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = await getAuthHeader();
      if (editingGame) {
        await axios.put(`http://localhost:3000/api/games/${editingGame.id}`, formData, { headers });
        const updatedGames = games.map((game) =>
          game.id === editingGame.id ? { ...game, ...formData } : game
        );
        setGames(updatedGames);
      } else {
        await axios.post("http://localhost:3000/api/games", formData, { headers });
        fetchGames();
      }
      setFormData({ name: "", price: "" });
      setEditingGame(null);
    } catch (error) {
      console.error("Error al guardar el juego:", error);
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({ name: game.name, price: game.price });
  };

  const handleDelete = async (gameId) => {
    try {
      const headers = await getAuthHeader();
      await axios.delete(`http://localhost:3000/api/games/${gameId}`, { headers });
      const updatedGames = games.filter((game) => game.id !== gameId);
      setGames(updatedGames);
      alert("Juego eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el juego:", error);
    }
  };

  // Función para restaurar los juegos al estado por default
  const handleRestore = async () => {
    try {
      const headers = await getAuthHeader();
      await axios.post("http://localhost:3000/api/games/restore", null, { headers });
      fetchGames();
      alert("Juegos restaurados al estado por default.");
    } catch (error) {
      console.error("Error al restaurar juegos:", error);
      alert("Error al restaurar juegos");
    }
  };

  // Botón para volver al AdminPanel
  const handleBackToAdmin = () => {
    navigate("/adminpanel");
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      {/* Botón para volver al AdminPanel */}
      <div className="mb-4">
        <button
          onClick={handleBackToAdmin}
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
        >
          Volver al AdminPanel
        </button>
      </div>

      <h2 className="text-3xl font-semibold mb-6">Gestión de Juegos</h2>

      {/* Botón para restaurar cambios */}
      <div className="mb-4">
        <button
          onClick={handleRestore}
          className="bg-orange-500 hover:bg-orange-600 p-2 rounded"
        >
          Restaurar Cambios
        </button>
      </div>

      {/* Formulario para agregar o editar juego */}
      <form onSubmit={handleFormSubmit} className="mb-8">
        <input
          type="text"
          placeholder="Nombre del juego"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-2 rounded mr-2"
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="p-2 rounded mr-2"
          required
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 p-2 rounded"
        >
          {editingGame ? "Actualizar Juego" : "Agregar Juego"}
        </button>
        {editingGame && (
          <button
            type="button"
            onClick={() => {
              setEditingGame(null);
              setFormData({ name: "", price: "" });
            }}
            className="bg-gray-500 hover:bg-gray-600 p-2 rounded ml-2"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Listado de juegos */}
      {games.length === 0 ? (
        <p>No hay juegos disponibles.</p>
      ) : (
        <ul>
          {games.map((game) => (
            <li key={game.id} className="mb-2 flex justify-between items-center border-b border-gray-700 py-2">
              <span>{game.name} - ${game.price}</span>
              <div>
                <button
                  onClick={() => handleEdit(game)}
                  className="bg-blue-500 hover:bg-blue-600 p-2 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(game.id)}
                  className="bg-red-500 hover:bg-red-600 p-2 rounded"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApiGames;
