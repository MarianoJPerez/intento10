import React, { useState, useEffect } from 'react';
import LoginWithCarouselAPI from './components/LoginWithCarouselAPI';
import GameList from './components/GameList';
import Wishlist from './components/Wishlist';
import Navbar from './components/Navbar';
import Header from './components/Header';
import GameDetail from './components/GameDetail'; // Asegúrate de importar GameDetail
import axios from 'axios';
import './styles.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('games');
  const [selectedGame, setSelectedGame] = useState(null);

  // Fetch de la API para obtener los juegos
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965');
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

  // Función para manejar el clic en un juego
  const handleGameClick = (game) => {
    setSelectedGame(game);
    setCurrentView('gameDetail');
  };

  return (
    <div className="min-h-screen text-white">
      {!currentUser ? (
        <LoginWithCarouselAPI setCurrentUser={setCurrentUser} />
      ) : (
        <div>
          <Header currentUser={currentUser} handleLogout={handleLogout} />
          <Navbar currentView={currentView} setCurrentView={setCurrentView} />
          {loading ? (
            <p className="text-center">Cargando juegos...</p>
          ) : (
            <>
              {currentView === 'games' && (
                <GameList
                  games={games}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                  onGameClick={handleGameClick}
                />
              )}
              {currentView === 'wishlist' && (
                <Wishlist currentUser={currentUser} removeFromWishlist={removeFromWishlist} />
              )}
              {currentView === 'gameDetail' && selectedGame && (
                <GameDetail game={selectedGame} setCurrentView={setCurrentView} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
