import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ApiGames = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [editingGame, setEditingGame] = useState(null);

  // Verifica que el usuario sea admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!auth.currentUser) {
        navigate("/");
        return;
      }
      const tokenResult = await auth.currentUser.getIdTokenResult();
      if (tokenResult.claims.role !== "admin") {
        navigate("/"); // Redirige si el usuario no es admin
      }
    };
    checkAdmin();
  }, [auth, navigate]);

  // Cargar juegos desde la API
  useEffect(() => {
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

    fetchGames();
  }, []);

  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGame) {
        
        await axios.put(`http://localhost:3000/api/games/${editingGame.id}`, formData);
      } else {
        
        await axios.post("http://localhost:3000/api/games", formData);
      }
      
      const response = await axios.get("http://localhost:3000/api/games");
      setGames(response.data);
      setFormData({ name: "", price: "" });
      setEditingGame(null);
    } catch (error) {
      console.error("Error al guardar el juego:", error);
    }
  };

  // Preparar el formulario para editar un juego existente
  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({ name: game.name, price: game.price });
  };

  // Manejar eliminación de un juego
  const handleDelete = async (gameId) => {
    try {
      await axios.delete(`http://localhost:3000/api/games/${gameId}`);
      setGames(games.filter((game) => game.id !== gameId));
    } catch (error) {
      console.error("Error al eliminar el juego:", error);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-3xl font-semibold mb-6">Gestión de Juegos</h2>
      
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
