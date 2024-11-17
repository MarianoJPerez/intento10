import React, { useState, useEffect } from 'react';
import axios from 'axios';
  {/* en lo que seria el codigo de la parte visual, utilizamos una misma imagen para las columnas izquierda y derecha (se utilizo la propiedad transform para invertir la imagen), ademas de esto pusimos un banner hecho con AI y editamos un formulario de login */}
const LoginWithCarouselAPI = ({ setCurrentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % games.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [games.length]);

  const handleLogin = (e) => {
    e.preventDefault();
    const userRole = username === 'admin' ? 'admin' : 'user';

    const user = { username, password, wishlist: [], role: userRole };
    if (username && password) {
      setCurrentUser(user);
      setError('');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="grid grid-cols-12 min-h-screen bg-gradient-to-b from-[#1e1e1e] via-[#1f2a21] to-[#101010] text-white">
      {/*aca doy vuelta la imagen de la columna asi combinan mirando al centro */}
      <div className="side-column invert-image col-span-1 md:col-span-2 h-full"></div>

      {/* Contenedor Principal */}
      <div className="col-span-10 md:col-span-8 flex flex-col items-center justify-start">
        {/* Banner de la pagina del login, tengo varios tipos de logotipos, no lo toquen que lo estoy testeando :)  */}
        <div className="w-full max-w-7xl my-1">
          <img
            src="/plataformasDesarrollo/infinity.jpg"
            alt="InfinityGames Banner"
            className="w-full h-48 md:h-64 lg:h-72 object-cover mx-auto"
          />
        </div>

        {/* aca inicio el div para el carrusel y el login */}
        <div className="flex flex-col md:flex-row items-stretch justify-center w-full gap-0 p-0">
  {/* Form */}
  <div className="flex-1 flex flex-col justify-center items-center bg-[#009940] rounded-lg mx-4 h-full">
    <h2 className="text-3xl font-bold mb-6">Iniciar Sesión</h2>
    <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-full max-w-sm">
      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-green-500"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Iniciar Sesión
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  </div>

{/* Carrusel */}
<div className="flex-1 flex justify-center items-center bg-[#009940] rounded-lg mx-4 h-full">
  <div className="relative w-full max-w-lg overflow-hidden shadow-lg">
    {games.length > 0 ? (
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {games.slice(0, 5).map((game) => (
          <div key={game.id} className="w-full flex-shrink-0 p-6 text-center">
            <img
              src={game.background_image}
              alt={game.name}
              className="w-full h-auto object-contain mb-4 rounded"
            />
            <h3 className="text-2xl font-semibold">{game.name}</h3>
          </div>
        ))}
      </div>
    ) : (
      <p>Cargando juegos...</p>
    )}
  </div>
</div>
</div>
      </div>

      <div className="side-column col-span-1 md:col-span-2 h-full"></div>
    </div>
  );
};

export default LoginWithCarouselAPI;