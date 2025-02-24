import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../assets/api.css";

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
    <div className="api-games">
      <div className="mb-4">
        <button onClick={handleBackToAdmin} className="btn">
          Volver al AdminPanel
        </button>
      </div>

      <h2>Gestión de Juegos</h2>

      <div className="mb-4">
        <button onClick={handleRestore} className="btn">
          Restaurar Cambios
        </button>
      </div>

      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Nombre del juego"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
        <button type="submit" className="btn">
          {editingGame ? "Actualizar Juego" : "Agregar Juego"}
        </button>
        {editingGame && (
          <button
            type="button"
            onClick={() => {
              setEditingGame(null);
              setFormData({ name: "", price: "" });
            }}
            className="btn"
          >
            Cancelar
          </button>
        )}
      </form>

      {games.length === 0 ? (
        <p>No hay juegos disponibles.</p>
      ) : (
        <ul className="game-list">
          {games.map((game) => (
            <li key={game.id}>
              <span>
                {game.name} - ${game.price}
              </span>
              <div className="btn-group">
                <button onClick={() => handleEdit(game)} className="btn">
                  Editar
                </button>
                <button onClick={() => handleDelete(game.id)} className="btn">
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
