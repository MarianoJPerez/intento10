// src/components/GameList.jsx
import React from 'react';

const GameList = ({ games, addToWishlist, removeFromWishlist }) => {
  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-100">Lista de Juegos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.length > 0 ? (
          games.map((game) => (
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
                  <h3 className="text-xl font-semibold truncate">{game.name}</h3>
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
                    onClick={() => addToWishlist(game)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    Agregar a Deseados
                  </button>
                  <button
                    onClick={() => removeFromWishlist(game)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No hay juegos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default GameList;