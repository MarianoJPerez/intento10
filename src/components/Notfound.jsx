import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>¡Nivel no encontrado!</h2>
      <p>Parece que te has perdido en el universo del juego.</p>
      <button
        onClick={() => setCurrentView('games')}
        className="back-button"
      >
        ⏎ Regresar al inicio
      </button>
    </div>
  );
};

export default NotFound;
