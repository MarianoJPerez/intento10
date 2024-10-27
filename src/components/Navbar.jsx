// src/components/Navbar.jsx
import React from 'react';

const Navbar = ({ currentView, setCurrentView }) => {
  return (
    <nav>
      <ul>
        <li onClick={() => setCurrentView('games')} style={{ cursor: 'pointer' }}>
          Lista de Juegos
        </li>
        <li onClick={() => setCurrentView('wishlist')} style={{ cursor: 'pointer' }}>
          Lista de Deseados
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
