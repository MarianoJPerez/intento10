import React, { useState, useEffect } from 'react';

const GameList = ({
  games,
  addToWishlist,
  removeFromWishlist,
  onGameClick,
  currentUser,
  removeGameFromStore,
}) => {
  const [removedGames, setRemovedGames] = useState([]); // Juegos eliminados
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal
  const [gameToRemove, setGameToRemove] = useState(null); // Juego a eliminar
  const [showCart, setShowCart] = useState(false); // Estado para alternar entre lista de juegos y carrito
  const [showLibrary, setShowLibrary] = useState(false); // Estado para alternar entre lista de juegos y biblioteca
  const [cart, setCart] = useState([]); // Estado para manejar el carrito
  const [library, setLibrary] = useState([]); // Estado para manejar la biblioteca

  // Cargar juegos eliminados desde localStorage al iniciar
  useEffect(() => {
    const storedRemovedGames = JSON.parse(localStorage.getItem('removedGames')) || [];
    setRemovedGames(storedRemovedGames);
  }, []);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  // Cargar biblioteca desde localStorage al iniciar
  useEffect(() => {
    const storedLibrary = JSON.parse(localStorage.getItem('library')) || [];
    setLibrary(storedLibrary);
  }, []);

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setGameToRemove(null);
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (gameToRemove) {
      removeGameFromStore(gameToRemove);

      const updatedRemovedGames = [...removedGames, gameToRemove];
      setRemovedGames(updatedRemovedGames);
      localStorage.setItem('removedGames', JSON.stringify(updatedRemovedGames));

      closeModal();
    }
  };

  // Filtrar juegos eliminados
  const filteredGames = games.filter(
    (game) => !removedGames.some((removed) => removed.id === game.id)
  );

  // Agregar juego al carrito
  const addToCart = (game) => {
    const updatedCart = [...cart, game];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart)); // Guardar carrito en localStorage
  };

  // Eliminar juego del carrito
  const removeFromCart = (game) => {
    const updatedCart = cart.filter((item) => item.id !== game.id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart)); // Actualizar carrito en localStorage
  };

  // Adquirir juego
  const acquireGame = (game) => {
    alert(`Juego "${game.name}" adquirido con éxito`);
    removeFromCart(game); // Eliminar juego del carrito tras adquirirlo
    const updatedLibrary = [...library, game];
    setLibrary(updatedLibrary);
    localStorage.setItem('library', JSON.stringify(updatedLibrary)); // Guardar en biblioteca
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-center text-gray-100">
          {showCart ? 'Carrito' : showLibrary ? 'Biblioteca' : 'Lista de Juegos'}
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setShowCart(false);
              setShowLibrary(false);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Lista de Juegos
          </button>
          <button
            onClick={() => {
              setShowCart(true);
              setShowLibrary(false);
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Ver Carrito
          </button>
          <button
            onClick={() => {
              setShowCart(false);
              setShowLibrary(true);
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Biblioteca
          </button>
        </div>
      </div>
      {showCart ? (
        // Vista del carrito
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cart.length > 0 ? (
            cart.map((game) => (
              <div
                key={game.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={game.background_image}
                  alt={game.name}
                  className="w-full h-48 object-contain"
                />
                <div className="p-4 space-y-2">
                  <h3 className="text-xl font-semibold truncate">{game.name}</h3>
                  <p className="text-sm text-gray-300">
                    <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(', ')}
                  </p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => removeFromCart(game)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => acquireGame(game)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Adquirir
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">Tu carrito está vacío.</p>
          )}
        </div>
      ) : showLibrary ? (
        // Vista de la biblioteca
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {library.length > 0 ? (
            library.map((game) => (
              <div
                key={game.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={game.background_image}
                  alt={game.name}
                  className="w-full h-48 object-contain"
                />
                <div className="p-4 space-y-2">
                  <h3 className="text-xl font-semibold truncate">{game.name}</h3>
                  <p className="text-sm text-gray-300">
                    <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(', ')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">Tu biblioteca está vacía.</p>
          )}
        </div>
      ) : (
        // Vista de la lista de juegos
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div
                key={game.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="relative">
                  {game.background_image && (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-full h-48 object-contain"
                    />
                  )}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent text-white p-4">
                    <h3
                      className="text-xl font-semibold truncate cursor-pointer"
                      onClick={() => onGameClick(game)}
                    >
                      {game.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-gray-300">
                    <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(', ')}
                  </p>
                  <div className="flex flex-col gap-2 mt-4">
                    {/* Botón Agregar a Deseados */}
                    {!currentUser?.wishlist.some((g) => g.id === game.id) && (
                      <button
                        onClick={() => addToWishlist(game)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                      >
                        Agregar a Deseados
                      </button>
                    )}

                    {/* Botón Remover de Deseados */}
                    {currentUser?.wishlist.some((g) => g.id === game.id) && (
                      <button
                        onClick={() => removeFromWishlist(game)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                      >
                        Remover de Deseados
                      </button>
                    )}

                    {/* Botón Agregar al Carrito */}
                    <button
                      onClick={() => addToCart(game)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No hay juegos disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GameList;
