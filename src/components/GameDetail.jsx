import React from 'react';

const GameDetail = ({ game, setCurrentView }) => {

    
  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <button
        onClick={() => setCurrentView('games')}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-6"
      >
        Volver a la Lista
      </button>

      <h2 className="text-4xl font-bold mb-4">{game.name}</h2>

      {/* Mostrar imagen de fondo */}
      {game.background_image && (
        <img
          src={game.background_image}
          alt={game.name}
          className="w-full h-64 object-contain mb-6"
        />
      )}

      {/* Información adicional */}
      <div className="space-y-4">
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

        {/* Mostrar las capturas de pantalla */}
        {game.short_screenshots && game.short_screenshots.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Capturas de Pantalla</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {game.short_screenshots.map((screenshot) => (
                <img
                  key={screenshot.id}
                  src={screenshot.image}
                  alt="Screenshot"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Mostrar tiendas */}
        {game.stores && game.stores.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Disponible en:</h3>
            <ul className="list-disc pl-5">
              {game.stores.map((store) => (
                <li key={store.store.id}>
                    {store.store.name}
                  
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mostrar etiquetas */}
        {game.tags && game.tags.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Etiquetas:</h3>
            <ul className="list-disc pl-5">
              {game.tags.map((tag) => (
                <li key={tag.id} className="text-gray-300">
                  {tag.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;
