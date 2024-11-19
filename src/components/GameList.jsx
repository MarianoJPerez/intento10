import React, { useState, useEffect } from 'react';

const GameList = ({
  games,
  addToWishlist,
  removeFromWishlist,
  onGameClick,
  currentUser,
  removeGameFromStore,
}) => {
  const [removedGames, setRemovedGames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToRemove, setGameToRemove] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [cart, setCart] = useState([]);
  const [library, setLibrary] = useState([]);

  
  //cargo los juegos eliminados desde localStorage al iniciar
  useEffect(() => {
    const storedRemovedGames = JSON.parse(localStorage.getItem('removedGames')) || [];
    setRemovedGames(storedRemovedGames);
  }, []);

  //cargo el carrito desde localStorage al iniciar
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  //cargo la biblioteca desde localStorage al iniciar
  useEffect(() => {
    const storedLibrary = JSON.parse(localStorage.getItem('library')) || [];
    setLibrary(storedLibrary);
  }, []);

  //modal y confirmar eliminacion
  const closeModal = () => {
    setIsModalOpen(false);
    setGameToRemove(null);
  };

  const confirmDelete = () => {
    if (gameToRemove) {
      removeGameFromStore(gameToRemove);

      const updatedRemovedGames = [...removedGames, gameToRemove];
      setRemovedGames(updatedRemovedGames);
      localStorage.setItem('removedGames', JSON.stringify(updatedRemovedGames));

      closeModal();
    }
  };

  //filtro los juegos eliminados
  const filteredGames = games.filter(
    (game) => !removedGames.some((removed) => removed.id === game.id)
  );

  //agrego el juego al carrito
  const addToCart = (game) => {
    const updatedCart = [...cart, game];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  //elimino juego del carrito
  const removeFromCart = (game) => {
    const updatedCart = cart.filter((item) => item.id !== game.id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  //comprar juego
  const acquireGame = (game) => {
    alert(`Juego "${game.name}" adquirido con éxito`);
    removeFromCart(game);
    const updatedLibrary = [...library, game];
    setLibrary(updatedLibrary);
    localStorage.setItem('library', JSON.stringify(updatedLibrary));
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

                    {!currentUser?.wishlist.some((g) => g.id === game.id) && (
                      <button
                        onClick={() => addToWishlist(game)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                      >
                        Agregar a Deseados
                      </button>
                    )}


                    {currentUser?.wishlist.some((g) => g.id === game.id) && (
                      <button
                        onClick={() => removeFromWishlist(game)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                      >
                        Remover de Deseados
                      </button>
                    )}


                    <button
                      onClick={() => addToCart(game)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Agregar al Carrito
                    </button>
                    {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setGameToRemove(game);
                        setIsModalOpen(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No hay juegos disponibles.</p>
          )}
        </div>
      )}

{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Confirmar Eliminación</h3> 
      <p className="text-gray-700">¿Estás seguro de que deseas eliminar este juego?</p>
      <div className="flex justify-between mt-4">
        <button
          onClick={confirmDelete}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Confirmar
        </button>
        <button
          onClick={closeModal}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
          </div>
  );
};

export default GameList;