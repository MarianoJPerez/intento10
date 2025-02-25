import React, { useState, useEffect } from 'react';

const AddGames = ({ games, removedGames, onAddGame, goBack }) => {
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para generar un precio aleatorio entre min y max
  const getRandomPrice = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // useEffect que obtiene los juegos de la API RAWG
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(
          'https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965&page=4&page_size=40'
        );
        const data = await response.json();

        // 1) Filtra los juegos que ya están en la lista local o removidos
        let filtered = data.results.filter(
          (game) =>
            !games.some((g) => g.id === game.id) &&
            !removedGames.some((removed) => removed.id === game.id)
        );

        // 2) Opcional: Limita a 15 resultados
        filtered = filtered.slice(0, 15);

        // 3) ASIGNA UN PRECIO a cada juego (fijo o aleatorio)
        // Por ejemplo, un precio aleatorio entre 10 y 50
        const filteredWithPrices = filtered.map((game) => ({
          ...game,
          price: getRandomPrice(10, 50), // Aquí decides el rango de precios
        }));

        // 4) Guarda en el estado con precios
        setAvailableGames(filteredWithPrices);
      } catch (error) {
        console.error('Error al cargar juegos:', error);
      }
    };

    fetchGames();
  }, [games, removedGames]);

  // Abrir modal de confirmación
  const openModal = (game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  // Confirmar adición
  const confirmAddGame = () => {
    if (selectedGame) {
      onAddGame(selectedGame);
      closeModal();
      goBack();
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h2 className="text-3xl font-semibold text-center text-gray-100 mb-6">
        Agregar Juegos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableGames.map((game) => (
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
                <strong>Géneros:</strong>{' '}
                {game.genres?.map((genre) => genre.name).join(', ')}
              </p>
              
              <p className="text-sm text-gray-300">
                <strong>Precio:</strong> ${game.price}
              </p>

              <button
                onClick={() => openModal(game)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mt-4"
              >
                Agregar Juego
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Confirmar Adición
            </h3>
            <p className="text-gray-700">
              ¿Estás seguro de que deseas agregar el juego "{selectedGame?.name}"?
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={confirmAddGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
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

export default AddGames;
