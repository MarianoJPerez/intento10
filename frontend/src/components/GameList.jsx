import React, { useState, useEffect } from 'react';
import AddGames from './AddGames';
import '../assets/gameList.css'; 

const GameList = ({
  games,
  addToWishlist,
  removeFromWishlist,
  onGameClick,
  currentUser,
  purchaseCart,
  cart = [],
  setCart,
  library = [],
  setLibrary,
}) => {
  const [localGames, setLocalGames] = useState([]);
  const [removedGames, setRemovedGames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToRemove, setGameToRemove] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentView, setCurrentView] = useState('list');

  
  useEffect(() => {
    const storedLocalGames = JSON.parse(localStorage.getItem('localGames'));
    if (!storedLocalGames || storedLocalGames.length === 0) {
      localStorage.setItem('localGames', JSON.stringify(games));
      setLocalGames(games);
    } else {
      setLocalGames(storedLocalGames);
    }
  }, [games]);

  useEffect(() => {
    if (currentUser) {
      const storedLibrary = JSON.parse(localStorage.getItem(`library_${currentUser.username}`)) || [];
      setLibrary(storedLibrary);
    }
  }, [currentUser, setLibrary]);

  const closeModal = () => {
    setIsModalOpen(false);
    setGameToRemove(null);
  };

  const confirmDelete = () => {
    if (gameToRemove) {
      const updatedLocalGames = localGames.filter((g) => g.id !== gameToRemove.id);
      setLocalGames(updatedLocalGames);
      localStorage.setItem('localGames', JSON.stringify(updatedLocalGames));

      const updatedRemovedGames = [...removedGames, gameToRemove];
      setRemovedGames(updatedRemovedGames);
      localStorage.setItem('removedGames', JSON.stringify(updatedRemovedGames));
      closeModal();
    }
  };

  const addToCart = (game) => {
    if (currentUser?.role === "admin") {
      alert("El administrador no puede agregar juegos al carrito.");
      return;
    }
    if (!cart.some((g) => g.id === game.id)) {
      const updatedCart = [...cart, { ...game }];
      setCart(updatedCart);
      localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(updatedCart));
      alert("El juego se agregó al carrito.");
    } else {
      alert("Este juego ya está en el carrito.");
    }
  };


  const removeFromCart = (game) => {
    const updatedCart = cart.filter((item) => item.id !== game.id);
    setCart(updatedCart);
    localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(updatedCart));
  };

 
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);


  const handleAddGame = (game) => {
    const isGameInList = localGames.some((existingGame) => existingGame.id === game.id);
    if (!isGameInList) {
      const updatedGames = [...localGames, game];
      setLocalGames(updatedGames);
      localStorage.setItem('localGames', JSON.stringify(updatedGames));
      alert('Juego agregado correctamente');
    } else {
      alert('El juego ya está en tu lista.');
    }
  };

  const addToWishlistWithAlert = (game) => {
    if (library?.some((libGame) => libGame.id === game.id)) {
      alert("Este juego ya está en tu biblioteca, no puedes agregarlo a deseados.");
    } else if (currentUser.wishlist?.some((wishGame) => wishGame.id === game.id)) {
      alert("Este juego ya está en tu lista de deseados.");
    } else {
      addToWishlist(game);
      alert("Se agregó a la lista de deseados correctamente.");
    }
  };

  const removeFromWishlistWithAlert = (game) => {
    removeFromWishlist(game);
    alert("Se eliminó de la lista de deseados");
  };

  return (
    <div className="game-list-page">
     
      <div className="game-list-banner"></div>
      <div className="game-list-container">
        {currentView === 'add' ? (
          <AddGames
            games={games}
            removedGames={removedGames}
            onAddGame={handleAddGame}
            goBack={() => setCurrentView('list')}
          />
        ) : (
          <>
            <h2 className="game-list-title">
              {showCart ? 'Carrito' : showLibrary ? 'Biblioteca' : 'Lista de Juegos'}
            </h2>

            <div className="game-list-nav">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('add')}
                  className="game-list-button"
                >
                  Agregar Juegos
                </button>
              )}
              <button
                onClick={() => {
                  setShowCart(false);
                  setShowLibrary(false);
                }}
                className="game-list-button"
              >
                Lista de Juegos
              </button>
              <button
                onClick={() => {
                  setShowCart(true);
                  setShowLibrary(false);
                }}
                className="game-list-button"
              >
                Ver Carrito
                
              </button>
              <button
                onClick={() => {
                  setShowCart(false);
                  setShowLibrary(true);
                }}
                className="game-list-button"
              >
                Biblioteca
              </button>
            <button
        onClick={() => {
          setCurrentView('wishlist');
          setSelectedGame(null);
        }}
        className="game-list-button"
      >
        Lista de Deseados
      </button>
            </div>

            {currentView === 'list' && (
              <>
                {showCart && (
                  <div className="game-card-grid">
                    {cart.length > 0 ? (
                      cart.map((game) => (
                        <div key={game.id} className="game-card">
                          <img src={game.background_image} alt={game.name} />
                          <h3 className="game-card-title">{game.name}</h3>
                          <p className="game-card-info">
                            <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(", ")}
                          </p>
                          <div className="game-card-actions">
                            <button
                              onClick={() => removeFromCart(game)}
                              className="game-list-button"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#ccc", textAlign: "center" }}>
                        Tu carrito está vacío.
                      </p>
                    )}
                  </div>
                )}

                {showLibrary && (
                  <div className="game-card-grid">
                    {library.length > 0 ? (
                      library.map((game) => (
                        <div key={game.id} className="game-card">
                          <img src={game.background_image} alt={game.name} />
                          <h3 className="game-card-title">{game.name}</h3>
                          <p className="game-card-info">
                            <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(", ")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#ccc", textAlign: "center" }}>
                        Tu biblioteca está vacía.
                      </p>
                    )}
                  </div>
                )}

                {!showCart && !showLibrary && (
                  <div className="game-card-grid">
                    {localGames.length > 0 ? (
                      localGames.map((game) => (
                        <div key={game.id} className="game-card">
                          <img src={game.background_image} alt={game.name} />
                          <h3
                            className="game-card-title"
                            onClick={() => onGameClick(game)}
                            style={{ cursor: "pointer" }}
                          >
                            {game.name}
                          </h3>
                          <p className="game-card-info">
                            <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(", ")}
                          </p>
                          <p className="game-card-info">
                            <strong>Plataformas:</strong> {game.platforms?.map((p) => p.platform.name).join(", ")}
                          </p>
                          <div className="game-card-actions">
                            <button
                              onClick={() => addToWishlistWithAlert(game)}
                              className="game-list-button"
                            >
                              Agregar a deseados
                            </button>
                            <button
                              onClick={() => addToCart(game)}
                              className="game-list-button"
                            >
                              Agregar al Carrito
                            </button>
                            {currentUser?.role === "admin" && (
                              <button
                                onClick={() => {
                                  setGameToRemove(game);
                                  setIsModalOpen(true);
                                }}
                                className="game-list-button"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#ccc", textAlign: "center" }}>
                        No hay juegos disponibles.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {isModalOpen && (
              <div className="game-list-modal-backdrop">
                <div className="game-list-modal">
                  <h3>Confirmar Eliminación</h3>
                  <p>¿Estás seguro de que deseas eliminar este juego?</p>
                  <div className="modal-buttons">
                    <button
                      onClick={confirmDelete}
                      className="game-list-button"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={closeModal}
                      className="game-list-button"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameList;
