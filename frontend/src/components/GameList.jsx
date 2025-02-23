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
  const [wishlist, setWishlist] = useState([]);
  const [removedGames, setRemovedGames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToRemove, setGameToRemove] = useState(null);
  const [currentView, setCurrentView] = useState('list');

  
  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 8;


  useEffect(() => {
    const storedLocalGames = JSON.parse(localStorage.getItem('localGames'));
    if (!storedLocalGames || storedLocalGames.length === 0) {
     
      localStorage.setItem('localGames', JSON.stringify(games));
      setLocalGames(games);
    } else {
      
      const updated = storedLocalGames.map((game) => ({
        ...game,
        price: game.price ?? Math.floor(Math.random() * (100 - 20 + 1)) + 20
              
      }));
      
      localStorage.setItem('localGames', JSON.stringify(updated));
      setLocalGames(updated);
    }
  }, [games]);
  

  // WISHLIST
  useEffect(() => {
    if (currentUser) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUser.username}`)) || [];
      setWishlist(storedWishlist);
    }
  }, [currentUser]);

  // BIBLIOTECA
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

  // CONFIRMACION
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
  // COMPRAR
  const purchaseGame = (game) => {
    if (currentUser?.role === "admin") {
      alert("El administrador no puede comprar juegos.");
      return;
    }

    // Verifica
    if (library.some((libGame) => libGame.id === game.id)) {
      alert("Este juego ya está en tu biblioteca.");
      return;
    }

    // AGREGAR A LA BIBLIO
    const updatedLibrary = [...library, game];
    setLibrary(updatedLibrary);
    localStorage.setItem(
      `library_${currentUser.username}`,
      JSON.stringify(updatedLibrary)
    );

    // QUITA DEL CARRITO
    const updatedCart = cart.filter((item) => item.id !== game.id);
    setCart(updatedCart);
    localStorage.setItem(
      `cart_${currentUser.username}`,
      JSON.stringify(updatedCart)
    );

    alert(`Has comprado "${game.name}". ¡Revisa tu biblioteca!`);
  };

  // CARRITO
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

  //  localStorage
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

  // WISHLIST
  const addToWishlistWithAlert = (game) => {
    if (library.some((libGame) => libGame.id === game.id)) {
      alert("Este juego ya está en tu biblioteca, no puedes agregarlo a deseados.");
    } else if (wishlist.some((wishGame) => wishGame.id === game.id)) {
      alert("Este juego ya está en tu lista de deseados.");
    } else {
      const updatedWishlist = [...wishlist, game];
      setWishlist(updatedWishlist);
      localStorage.setItem(`wishlist_${currentUser.username}`, JSON.stringify(updatedWishlist));
      alert("Se agregó a la lista de deseados correctamente.");
    }
  };


  const removeFromWishlistWithAlert = (game) => {
    const updatedWishlist = wishlist.filter((wishGame) => wishGame.id !== game.id);
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${currentUser.username}`, JSON.stringify(updatedWishlist));
    removeFromWishlist(game);
    alert("Se eliminó de la lista de deseados");
  };

  // PAGINACIÓN
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = localGames.slice(indexOfFirstGame, indexOfLastGame);

  // ARRAY
  const totalPages = Math.ceil(localGames.length / gamesPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="game-list-page">
      <div className="game-list-banner"></div>
      <div className="game-list-container">
        {currentView === 'add' ? (
          <AddGames
            games={localGames}
            removedGames={removedGames}
            onAddGame={handleAddGame}
            goBack={() => setCurrentView('list')}
          />
        ) : (
          <>
            <h2 className="game-list-title">
              {currentView === 'list'
                ? 'Lista de Juegos'
                : currentView === 'wishlist'
                  ? 'Lista de Deseados'
                  : currentView === 'cart'
                    ? 'Carrito'
                    : currentView === 'library'
                      ? 'Biblioteca'
                      : ''
              }
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
                onClick={() => setCurrentView('list')}
                className="game-list-button"
              >
                Lista de Juegos
              </button>

              <button
                onClick={() => setCurrentView('wishlist')}
                className="game-list-button"
              >
                Lista de Deseados
              </button>

              <button
                onClick={() => setCurrentView('cart')}
                className="game-list-button"
              >
                Ver Carrito
              </button>

              <button
                onClick={() => setCurrentView('library')}
                className="game-list-button"
              >
                Biblioteca
              </button>
            </div>

            {/* VISTA: gamelist */}
            {currentView === 'list' && (
              <div>
                <div className="game-card-grid">
                  {currentGames.length > 0 ? (
                    currentGames.map((game) => (
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
                          <strong>Géneros:</strong>{" "}
                          {game.genres?.map((genre) => genre.name).join(", ")}
                        </p>
                        <p className="game-card-info">
                          <strong>Plataformas:</strong>{" "}
                          {game.platforms?.map((p) => p.platform.name).join(", ")}
                        </p>
                        <p className="game-card-info">
                          <strong>Precio:</strong> ${game.price}
                        </p>
                        <div className="game-card-actions">
                          <button
                            onClick={() => addToWishlistWithAlert(game)}
                            className="game-list-button"
                          >
                            Agregar a Deseados
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

                {/* PAGINACION: botones */}
                <div className="pagination" style={{ textAlign: 'center', marginTop: '20px' }}>
                  {/* BOTON: anterior */}
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="game-list-button"
                  >
                    Anterior
                  </button>

                  {/* BOTONES: numeros */}
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => setCurrentPage(number)}
                      disabled={currentPage === number}
                      className="game-list-button pagination-button"
                    >
                      {number}
                    </button>
                  ))}

                  {/* BOTON: siguiente */}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="game-list-button"
                  >
                    Siguiente
                  </button>
                </div>

                {/* LEYENDA: numero de pagina*/}
                <div style={{ textAlign: 'center', marginTop: '10px', color: 'red' }}>
                  Página {currentPage}
                </div>
              </div>
            )}

            {/* VISTA: Lista de deseados */}
            {currentView === 'wishlist' && (
              <div className="game-card-grid">
                {wishlist.length > 0 ? (
                  wishlist.map((game) => (
                    <div key={game.id} className="game-card">
                      <img src={game.background_image} alt={game.name} />
                      <h3 className="game-card-title">{game.name}</h3>
                      <p className="game-card-info">
                        <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(", ")}
                      </p>
                      <button
                        onClick={() => removeFromWishlistWithAlert(game)}
                        className="game-list-button"
                      >
                        Eliminar de Deseados
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#ccc", textAlign: "center" }}>No hay juegos en tu lista de deseados.</p>
                )}
              </div>
            )}

            {/* VISTA: Carrito */}
            {currentView === 'cart' && (
              <div className="game-card-grid">
                {cart.length > 0 ? (
                  cart.map((game) => (
                    <div key={game.id} className="game-card">
                      <img src={game.background_image} alt={game.name} />
                      <h3 className="game-card-title">{game.name}</h3>
                      <p className="game-card-info">
                        <strong>Géneros:</strong>{" "}
                        {game.genres?.map((genre) => genre.name).join(", ")}
                      </p>

                      {/* BOTON: comprar */}
                      <button
                        onClick={() => purchaseGame(game)}
                        className="game-list-button"
                      >
                        Comprar
                      </button>

                      {/* BOTON: eliminar) */}
                      <button
                        onClick={() => removeFromCart(game)}
                        className="game-list-button"
                      >
                        Eliminar del Carrito
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#ccc", textAlign: "center" }}>
                    Tu carrito está vacío.
                  </p>
                )}
              </div>
            )}


            {/* VISTA: Biblioteca */}
            {currentView === 'library' && (
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
                  <p style={{ color: "#ccc", textAlign: "center" }}>Tu biblioteca está vacía.</p>
                )}
              </div>
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
