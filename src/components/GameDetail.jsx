import React from 'react';

const GameDetail = ({ game, onBack }) => {
  return (
    <div className="bg-gray-900 min-h-screen text-white p-8 flex flex-col items-center">
      {/* Header con botón de retroceso */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">INFINITY GAMES</h2>
       
      </div>

      {/* Contenedor principal */}
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl p-6">
        {/* Título y imagen principal */}
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          <div className="flex-shrink-0">
            {game.background_image && (
              <img
                src={game.background_image}
                alt={game.name}
                className="w-full max-w-lg rounded-lg shadow-md"
              />
            )}
          </div>

          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
            <p className="text-gray-300">
              <strong>Géneros:</strong> {game.genres?.map((genre) => genre.name).join(', ')}
            </p>
            <p className="text-gray-300">
              <strong>Metacritic:</strong> {game.metacritic}
            </p>
            <p className="text-gray-300">
              <strong>Tiempo de juego:</strong> {game.playtime} horas
            </p>
            <p className="text-gray-300">
              <strong>Fecha de lanzamiento:</strong> {game.released}
            </p>
          </div>
        </div>

        {/* Capturas de pantalla */}
        {game.short_screenshots && game.short_screenshots.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Capturas de Pantalla</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {game.short_screenshots.map((screenshot) => (
                <img
                  key={screenshot.id}
                  src={screenshot.image}
                  alt="Screenshot"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Tiendas */}
        {game.stores && game.stores.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Disponible en:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              {game.stores.map((store) => (
                <li key={store.store.id}>{store.store.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Etiquetas */}
        {game.tags && game.tags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Etiquetas:</h3>
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;