import React, { useState, useEffect } from 'react';
import LoginWithCarouselAPI from './components/LoginWithCarouselAPI';
import GameList from './components/GameList';
import Wishlist from './components/Wishlist';
import Navbar from './components/Navbar';
import Header from './components/Header';
import GameDetail from './components/GameDetail';
import axios from 'axios';
import './styles.css';
import NotFound from './components/Notfound';
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('games');
  const [selectedGame, setSelectedGame] = useState(null);

  //Con esto recupero el usuario
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      // Recuperamos la wishlist específica para ese usuario y la asignamos al estado
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${storedUser.userId}`));
      storedUser.wishlist = storedWishlist || [];
      setCurrentUser(storedUser);
    }
  }, []);

  //Fetch de la API para obtener los juegos
  useEffect(() => {
    const fetchGames = async () => {
      const page = 1;
      const pageSize = 40;
      try {
        const response = await axios.get(`https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965&page=${page}&page_size=${pageSize}`);
        const fetchedGames = response.data.results;
        
        // Guardamos los juegos en localStorage
        localStorage.setItem('games', JSON.stringify(fetchedGames));
        
        // Verificar los juegos
        console.log('Juegos obtenidos de la API:', fetchedGames);
        
        setGames(fetchedGames);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener juegos:', error);
        setLoading(false);
      }
    };
  
    // Intentamos cargar los juegos desde localStorage primero
    const storedGames = JSON.parse(localStorage.getItem('games'));
    if (storedGames) {
      console.log('Juegos cargados desde localStorage:', storedGames);
      setGames(storedGames);
      setLoading(false);
    } else {
      fetchGames(); // Si no hay juegos en localStorage, hacemos la petición a la API
    }
  }, []);
  


  const handleLogout = () => {
    if (currentUser && currentUser.wishlist?.length > 0) {
      localStorage.setItem(`wishlist_${currentUser.userId}`, JSON.stringify(currentUser.wishlist));
    }
    setCurrentUser(null);
    localStorage.removeItem('user');
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
    setSelectedGame(null);
  };

  const addToWishlist = (game) => {
    if (currentUser) {
      const updatedWishlist = [...(currentUser.wishlist || []), game];
      const updatedUser = {
        ...currentUser,
        wishlist: updatedWishlist,
      };
  
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem(`wishlist_${currentUser.userId}`, JSON.stringify(updatedWishlist));
    }
  };
  
  const removeFromWishlist = (gameToRemove) => {
    if (currentUser) {
      const updatedWishlist = currentUser.wishlist.filter(
        (game) => game.id !== gameToRemove.id
      );
  
      const updatedUser = {
        ...currentUser,
        wishlist: updatedWishlist,
      };
  
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem(`wishlist_${currentUser.userId}`, JSON.stringify(updatedWishlist));
    }
  };



  return (
    <div className="min-h-screen text-white">
      {!currentUser ? (
        <LoginWithCarouselAPI setCurrentUser={setCurrentUser} />
      ) : (
        <div>
          <Header currentUser={currentUser} handleLogout={handleLogout} />
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
              {/* Si ninguna vista coincide, muestra la página 404 */}
              {!['games', 'wishlist', 'gameDetail'].includes(currentView) && (
                <NotFound />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
  
};

export default App;
