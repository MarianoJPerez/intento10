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
      const page = 1; // Número de página
      const pageSize = 40; // Cantidad de juegos por página
      try {
        const response = await axios.get(`https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965&page=${page}&page_size=${pageSize}`);    //ACA SE MODIFICA EL NUMERO DE PAGINA Y CANTIDAD DE JUEGOS
        setGames(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener juegos:', error);
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Función para eliminar un juego de la lista de juegos
  const removeGameFromStore = (gameToRemove) => {
    setGames((prevGames) => prevGames.filter((game) => game.id !== gameToRemove.id));
  };

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
    setCurrentUser(null); // Restablecer el estado del usuario
    localStorage.removeItem('user'); // Eliminar los datos del usuario en localStorage
  };

  // Función para manejar el clic en un juego
  const handleGameClick = (game) => {
    setSelectedGame(game);
    setCurrentView('gameDetail');
  };

  // Función para volver a la lista de deseados
  const handleBackToGames = () => {
    setCurrentView('games'); // Regresa a la vista de JUEGOS
    setSelectedGame(null); // Restablece el juego seleccionado
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
                  currentUser={currentUser}
                  removeGameFromStore={removeGameFromStore}
                  
                />
              )}
              {currentView === 'wishlist' && (
                <Wishlist 
                currentUser={currentUser} 
                removeFromWishlist={removeFromWishlist} 
                setSelectedGame={handleGameClick}
                />
              )}
              
              {selectedGame && (
              <GameDetail 
              game={selectedGame} // Muestra el detalle del juego cuando se selecciona uno
              setCurrentView={handleBackToGames} // Usamos esta nueva función para volver a la lista de deseados
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
