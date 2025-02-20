import React, { useEffect, useState } from 'react';

const Wishlist = ({ currentUser, removeFromWishlist, setSelectedGame }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUser.username}`)) || [];
      setWishlist(storedWishlist);
    }
  }, [currentUser]);

  const handleGameClick = (game) => {
    setSelectedGame(game);
  };

  const handleRemoveFromWishlist = (game) => {
    const updatedWishlist = wishlist.filter((wishGame) => wishGame.id !== game.id);
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${currentUser.username}`, JSON.stringify(updatedWishlist));
    removeFromWishlist(game);
  };

  return (
    <div className="bg-gray-900 text-white p-8">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-100">Lista de Deseados</h2>
      {wishlist.length > 0 ? (
        wishlist.map((game) => (
          <div key={game.id} className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 hover:shadow-2xl transition-shadow duration-300">
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
                <h3 onClick={() => handleGameClick(game)} className="text-xl font-semibold text-blue-400 cursor-pointer">
                  {game.name}
                </h3>
              </div>
              <button
                onClick={() => handleRemoveFromWishlist(game)}
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
