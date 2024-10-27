// src/components/GameList.jsx
import React from 'react';

const GameList = ({ games, addToWishlist, removeFromWishlist, currentUser }) => {
  return (
    <div>
      <h2>Lista de Juegos</h2>
      {games.length > 0 ? (
        games.map((game) => (
          <div key={game.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>{game.name}</h3>
            {game.background_image && <img src={game.background_image} alt={game.name} style={{ width: '200px' }} />}
            <p><strong>Géneros:</strong> {game.genres?.map(genre => genre.name).join(', ')}</p>
            <p><strong>Plataformas:</strong> {game.platforms?.map(platform => platform.platform.name).join(', ')}</p>
            <p><strong>Metacritic:</strong> {game.metacritic}</p>

            <button onClick={() => addToWishlist(game)}>Agregar a la Lista de Deseados</button>
            <button onClick={() => removeFromWishlist(game)}>Eliminar de la Lista de Deseados</button>
          </div>
        ))
      ) : (
        <p>No hay juegos disponibles.</p>
      )}
    </div>
  );
};

export default GameList;
