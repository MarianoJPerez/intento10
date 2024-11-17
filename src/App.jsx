import React, { useState, useEffect } from 'react';
import LoginWithCarouselAPI from './components/LoginWithCarouselAPI';
import GameList from './components/GameList';
import Wishlist from './components/Wishlist';
import Navbar from './components/Navbar';
import Header from './components/Header';
import GameDetail from './components/GameDetail';
import axios from 'axios';
import './styles.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('games');
  const [selectedGame, setSelectedGame] = useState(null);



  // Recuperar usuario de localStorage si está presente al cargar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser)); // Si el usuario está en localStorage, lo carga
    }
  }, []);

  // Fetch de la API para obtener los juegos
  useEffect(() => {
    const fetchGames = async () => {
      const page = 1;
      const pageSize = 40;
      try {
        const response = await axios.get(`https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965&page=${page}&page_size=${pageSize}`);
        setGames(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener juegos:', error);
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null); // Restablecer el estado del usuario
    localStorage.removeItem('user'); // Eliminar los datos del usuario en localStorage
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setCurrentView('gameDetail');
  };

  const handleBackToGames = () => {
    setCurrentView('games');
    setSelectedGame(null);
  };

  const handleBackToWishlist = () => {
    setCurrentView('wishlist');
    setSelectedGame(null);  // Limpiar juego seleccionado cuando se navega a Wishlist
  };

  const addToWishlist = (game) => {
    // Asegúrate de que currentUser esté disponible
    if (currentUser) {
      // Actualiza la wishlist del usuario
      const updatedUser = {
        ...currentUser,
        wishlist: [...currentUser.wishlist, game],
      };
  
      setCurrentUser(updatedUser); // Actualiza el estado de currentUser
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));// También puedes guardar la wishlist en localStorage o en tu backend si lo necesitas
    }
  };

  const removeFromWishlist = (gameToRemove) => {
    if (currentUser) {
      // Filtrar el juego que se va a eliminar de la wishlist
      const updatedWishlist = currentUser.wishlist.filter((game) => game.id !== gameToRemove.id);
      
      // Actualizar el estado de currentUser
      const updatedUser = {
        ...currentUser,
        wishlist: updatedWishlist,
      };
  
      setCurrentUser(updatedUser); // Actualizar el estado de currentUser
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));// También puedes guardar la nueva wishlist en localStorage o en tu backend si lo necesitas
    }
  };



  return (
    <div className="min-h-screen text-white">
      {!currentUser ? (
        <LoginWithCarouselAPI setCurrentUser={setCurrentUser} />
      ) : (
        <div>
          <Header 
          currentUser={currentUser} 
          handleLogout={handleLogout} />
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            setSelectedGame={setSelectedGame}
            handleBackToGames={handleBackToGames}
            handleBackToWishlist={handleBackToWishlist}
          />
          {loading ? (
            <p className="text-center">Cargando juegos...</p>
          ) : (
            <>
              {currentView === 'games' && (
                <GameList
                  games={games}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={() => {}}
                  onGameClick={handleGameClick}
                  currentUser={currentUser}
                  removeGameFromStore={() => {}}
                />
              )}
              {currentView === 'wishlist' && (
                <Wishlist
                  currentUser={currentUser}
                  removeFromWishlist={removeFromWishlist}
                  setSelectedGame={handleGameClick}
                />
              )}
              {currentView === 'gameDetail' && selectedGame && (
                <GameDetail
                  game={selectedGame}
                  setCurrentView={handleBackToGames}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
