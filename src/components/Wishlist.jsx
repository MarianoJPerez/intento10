// src/components/Wishlist.jsx
import React from 'react';

const Wishlist = ({ currentUser, removeFromWishlist }) => {
  return (
    <div>
      <h2>Lista de Deseados</h2>
      {currentUser.wishlist && currentUser.wishlist.length > 0 ? (
        currentUser.wishlist.map((game) => (
          <div key={game.id}>
            <h3>{game.name}</h3>
            {game.background_image && <img src={game.background_image} alt={game.name} style={{ width: '200px' }} />}
            <button onClick={() => removeFromWishlist(game)}>Eliminar de la Lista de Deseados</button>
          </div>
        ))
      ) : (
        <p>No hay juegos en la lista de deseados.</p>
      )}
    </div>
  );
};

export default Wishlist;

