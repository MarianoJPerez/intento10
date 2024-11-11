// src/components/Navbar.jsx
import React from 'react';

const Navbar = ({ currentView, setCurrentView }) => {
  return (
    <nav className="bg-red-600 p-1">
      <ul>
        <li onClick={() => setCurrentView('games')} className="cursor-pointer text-white bg-black font-bold text-lg px-4 py-2 rounded border-2  inline-block hover:bg-blue-600">
          Lista de Juegos
        </li>
        <li
  onClick={() => setCurrentView('wishlist')}
  className="cursor-pointer text-white bg-black font-bold text-lg px-4 py-2 rounded border-2  inline-block hover:bg-blue-600"
>
  Lista de Deseados
</li>
      </ul>
    </nav>
  );
};

export default Navbar;
