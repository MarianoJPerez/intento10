// src/components/LoginWithCarouselAPI.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginWithCarouselAPI = ({ setCurrentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modifique el login que hiciste gus, lo cambie por un login con carrusel todo con tailwind css
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965');
        setGames(response.data.results);
      } catch (error) {
        console.error('Error al obtener juegos:', error);
      }
    };

    fetchGames();
  }, []);

  // El buen carrusel, nada le gana
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % games.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, [games.length]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = { username, password, wishlist: [] }
    if (username && password) {
      setCurrentUser(user);
      setError('');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
    
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-800">
        <h2 className="text-3xl font-bold mb-6">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Iniciar Sesión
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>

    
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="relative w-full max-w-lg bg-gray-700 rounded-lg overflow-hidden shadow-lg">
          {games.length > 0 ? (
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {games.slice(0, 5).map((game, index) => (
                <div key={game.id} className="w-full flex-shrink-0 p-6 text-center">
                  <img
                    src={game.background_image}
                    alt={game.name}
                    className="w-full h-40 object-cover mb-4 rounded"
                  />
                  <h3 className="text-2xl font-semibold">{game.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p>Cargando ofertas...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginWithCarouselAPI;