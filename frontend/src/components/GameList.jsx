import React, { useState, useEffect } from 'react';
import AddGames from './AddGames';
import GameDetail from './GameDetail';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import '../assets/gameList.css';

const GameList = ({
  addToWishlist,
  removeFromWishlist,
  currentUser,
  purchaseCart,
  cart = [],
  setCart,
  library = [],
  setLibrary,
}) => {
  const [localGames, setLocalGames] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToRemove, setGameToRemove] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedGame, setSelectedGame] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 8;

  // Función para obtener la lista de juegos desde el backend
  const fetchGames = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/games");
      setLocalGames(response.data);
    } catch (error) {
      console.error("Error al obtener juegos:", error);
    }
  };

  // Se carga la lista al montar el componente
  useEffect(() => {
    fetchGames();
  }, []);

  // Cargar wishlist y biblioteca desde localStorage
  useEffect(() => {
    if (currentUser) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUser.username}`)) || [];
      setWishlist(storedWishlist);
      const storedLibrary = JSON.parse(localStorage.getItem(`library_${currentUser.username}`)) || [];
      setLibrary(storedLibrary);
    }
  }, [currentUser, setLibrary]);

  const closeModal = () => {
    setIsModalOpen(false);
    setGameToRemove(null);
  };

  // CONFIRMAR ELIMINACIÓN
  const confirmDelete = async () => {
    if (gameToRemove) {
      try {
        await axios.delete(`http://localhost:3000/api/games/${gameToRemove.id}`);
        fetchGames();
        closeModal();
      } catch (error) {
        console.error("Error al eliminar el juego:", error);
      }
    }
  };

  // Función para obtener los mensajes del usuario
  const fetchMessages = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No hay usuario autenticado en Firebase Auth.");
        return;
      }
      const token = await user.getIdToken();
      const response = await axios.get("http://localhost:3000/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Mensajes obtenidos:", response.data);
      setMessages(response.data);
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  };

  // Listener para actualizar mensajes cuando el usuario está autenticado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMessages();
      }
    });
    return () => unsubscribe();
  }, []);

  // COMPRAR
  const purchaseGame = (game) => {
    if (currentUser?.role === "admin") {
      alert("El administrador no puede comprar juegos.");
      return;
    }
    if (library.some((libGame) => libGame.id === game.id)) {
      alert("Este juego ya está en tu biblioteca.");
      return;
    }
    const updatedLibrary = [...library, game];
    setLibrary(updatedLibrary);
    localStorage.setItem(`library_${currentUser.username}`, JSON.stringify(updatedLibrary));

    const updatedCart = cart.filter((item) => item.id !== game.id);
    setCart(updatedCart);
    localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(updatedCart));

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

  // Sincronizar cart con localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  // Función para agregar juego
  const handleAddGame = async (game) => {
    try {
      await axios.post("http://localhost:3000/api/games", game);
      fetchGames();
      alert('Juego agregado correctamente');
    } catch (error) {
      console.error("Error al agregar juego:", error);
      alert("Error al agregar el juego");
    }
  };

  // WISHLIST: agregar y eliminar con alertas
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
  const totalPages = Math.ceil(localGames.length / gamesPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Si se ha seleccionado un juego, se muestra el detalle
  if (selectedGame) {
    return (
      <GameDetail 
        game={selectedGame} 
        onBack={() => {
          setSelectedGame(null);
          setCurrentView('list');
        }} 
      />
    );
  }

  return (
    <div className="game-list-page">
      <div className="game-list-banner"></div>
      <div className="game-list-container">
        {/* Botón para mostrar/ocultar notificaciones */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button 
            className="game-list-button" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            Notificaciones
          </button>
        </div>

        {/* Sección de mensajes recibidos */}
        {showNotifications && (
          <div className="user-messages">
            <h3 className="game-list-title">Mensajes Recibidos</h3>
            {messages.length > 0 ? (
              <ul>
                {messages.map((msg, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem", background: "#141414", padding: "0.5rem", borderRadius: "4px" }}>
                    <p style={{ color: "#ccc", margin: 0 }}>{msg.message}</p>
                    <small style={{ color: "#0aff90" }}>{new Date(msg.timestamp).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#ccc", textAlign: "center" }}>No tienes notificaciones</p>
            )}
          </div>
        )}

        {currentView === 'add' ? (
          <AddGames
            games={localGames}
            removedGames={[]}
            onAddGame={handleAddGame}
            goBack={() => {
              setCurrentView('list');
              fetchGames();
            }}
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
                <button onClick={() => setCurrentView('add')} className="game-list-button">
                  Agregar Juegos
                </button>
              )}
              <button onClick={() => setCurrentView('list')} className="game-list-button">
                Lista de Juegos
              </button>
              <button onClick={() => setCurrentView('wishlist')} className="game-list-button">
                Lista de Deseados
              </button>
              <button onClick={() => setCurrentView('cart')} className="game-list-button">
                Ver Carrito
              </button>
              <button onClick={() => setCurrentView('library')} className="game-list-button">
                Biblioteca
              </button>
            </div>

            {/* VISTA: Lista de juegos */}
            {currentView === 'list' && (
              <div>
                <div className="game-card-grid">
                  {currentGames.length > 0 ? (
                    currentGames.map((game) => (
                      <div key={game.id} className="game-card">
                        <img src={game.background_image} alt={game.name} />
                        <h3
                          className="game-card-title"
                          onClick={() => setSelectedGame(game)}
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

                {/* PAGINACIÓN */}
                <div className="pagination" style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="game-list-button"
                  >
                    Anterior
                  </button>
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
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="game-list-button"
                  >
                    Siguiente
                  </button>
                </div>

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
                  <p style={{ color: "#ccc", textAlign: "center" }}>
                    No hay juegos en tu lista de deseados.
                  </p>
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
                        <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(", ")}
                      </p>
                      <button
                        onClick={() => purchaseGame(game)}
                        className="game-list-button"
                      >
                        Comprar
                      </button>
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
                  <p style={{ color: "#ccc", textAlign: "center" }}>
                    Tu biblioteca está vacía.
                  </p>
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
