// src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import GameList from './components/GameList';
import Wishlist from './components/Wishlist';
import Navbar from './components/Navbar';
import axios from 'axios';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('games');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965`);
        setGames(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener juegos:', error);
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const addToWishlist = (game) => {
    if (currentUser) {
      // Evita la mutación del estado, crea un nuevo objeto de usuario
      const updatedWishlist = [...currentUser.wishlist, game];
      setCurrentUser({ ...currentUser, wishlist: updatedWishlist });
    }
  };

  const removeFromWishlist = (game) => {
    if (currentUser) {
      const updatedWishlist = currentUser.wishlist.filter((g) => g.id !== game.id);
      setCurrentUser({ ...currentUser, wishlist: updatedWishlist });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div>
      {!currentUser ? (
        <Login setCurrentUser={setCurrentUser} />
      ) : (
        <div>
          <h1>Bienvenido, {currentUser.username}</h1>
          <button onClick={handleLogout}>Cerrar Sesión</button>
          <Navbar currentView={currentView} setCurrentView={setCurrentView} />
          {loading ? (
            <p>Cargando juegos...</p>
          ) : (
            <>
              {currentView === 'games' ? (
                <GameList
                  games={games}
                  currentUser={currentUser}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              ) : (
                <Wishlist currentUser={currentUser} removeFromWishlist={removeFromWishlist} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
