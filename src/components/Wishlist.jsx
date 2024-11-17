import React from 'react';

const Wishlist = ({ currentUser, removeFromWishlist, setSelectedGame }) => {
  const handleGameClick = (game) => {
    setSelectedGame(game); // Establece el juego seleccionado
  };

  return (
    <div className="bg-gray-900 text-white p-8">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-100">Lista de Deseados</h2>
      {currentUser.wishlist && currentUser.wishlist.length > 0 ? (
        currentUser.wishlist.map((game) => (
          <div
            key={game.id}
            className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center space-x-4">
              {game.background_image && (
                <img
                  src={game.background_image}
                  alt={game.name}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  className="rounded-lg"
                />
              )}
              <div className="flex-1">
                {/* Clic en el nombre del juego para ir al detalle */}
                <h3
                  onClick={() => handleGameClick(game)} // Cambia el juego seleccionado
                  className="text-xl font-semibold text-blue-400 cursor-pointer"
                >
                  {game.name}
                </h3>
              </div>
              <button
                onClick={() => removeFromWishlist(game)} // Elimina el juego de la lista
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Eliminar de la Lista de Deseados
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400">No hay juegos en la lista de deseados.</p>
      )}
    </div>
  );
};

export default Wishlist;
