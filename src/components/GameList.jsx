import React, { useState, useEffect } from 'react';

const GameList = ({ games, addToWishlist, removeFromWishlist, onGameClick, currentUser, removeGameFromStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const [gameToRemove, setGameToRemove] = useState(null); // Juego a eliminar
  const [removedGames, setRemovedGames] = useState([]); // Juegos eliminados

  // Cargar juegos eliminados desde localStorage al iniciar
  useEffect(() => {
    const storedRemovedGames = JSON.parse(localStorage.getItem('removedGames')) || [];
    setRemovedGames(storedRemovedGames);
  }, []);

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setGameToRemove(null);
  };

  // Función para confirmar la eliminación
  const confirmDelete = () => {
    if (gameToRemove) {
      // Eliminar el juego de la lista
      removeGameFromStore(gameToRemove);

      // Añadir el juego a la lista de eliminados
      const updatedRemovedGames = [...removedGames, gameToRemove];
      setRemovedGames(updatedRemovedGames);

      // Guardar los juegos eliminados en localStorage
      localStorage.setItem('removedGames', JSON.stringify(updatedRemovedGames));

      closeModal(); // Cerrar el modal
    }
  };

  const handleGameClick = (game) => {
    window.scrollTo(0, 0); // Desplaza la página al inicio
    onGameClick(game); // Llama a la función para ver los detalles del juego
  };

  // Filtrar juegos eliminados
  const filteredGames = games.filter((game) => !removedGames.some((removed) => removed.id === game.id));

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-100">Lista de Juegos</h2>
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
                  {/* Clic para ver detalles del juego */}
                  <h3
                    className="text-xl font-semibold truncate cursor-pointer"
                    onClick={() => handleGameClick(game)}
                  >
                    {game.name}
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-300">
                  <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(', ')}
                </p>
                <p className="text-sm text-gray-300">
                  <strong>Plataformas:</strong>{' '}
                  {game.platforms?.map((platform) => platform.platform.name).join(', ')}
                </p>
                <p className="text-sm text-yellow-400">
                  <strong>Metacritic:</strong> {game.metacritic}
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      // Verifica si el juego ya está en la lista de deseados
                      if (!currentUser?.wishlist.some((g) => g.id === game.id)) {
                        addToWishlist(game); // Solo agrega si no está en la lista
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    Agregar a Deseados
                  </button>
                  {/* Solo permitir eliminar si el usuario es admin */}
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setGameToRemove(game); // Establecer el juego a eliminar
                        setIsModalOpen(true); // Abrir el modal
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

      {/* Modal de confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este juego?</p>
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
