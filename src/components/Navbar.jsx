import React from 'react';

const Navbar = ({ currentView, setCurrentView, setSelectedGame}) => {
  return (
    <nav className="bg-red-600 p-2 flex justify-center space-x-4">
      <button
        onClick={() => {
          setCurrentView('games');
          setSelectedGame(null);
        }}
        className={`cursor-pointer text-white font-bold text-lg px-4 py-2 rounded border-2 ${
          currentView === 'games' ? 'bg-blue-600' : 'bg-black'
        } hover:bg-blue-500`}
      >
        Lista de Juegos
      </button>
      <button
        onClick={() => {
          setCurrentView('wishlist');
          setSelectedGame(null);
        }}
        className={`cursor-pointer text-white font-bold text-lg px-4 py-2 rounded border-2 ${
          currentView === 'wishlist' ? 'bg-blue-600' : 'bg-black'
        } hover:bg-blue-500`}
      >
        Lista de Deseados
      </button>
      <button
  onClick={() => {
    setCurrentView('unknown');
    setSelectedGame(null);
  }}
  className="cursor-pointer text-white font-bold text-lg px-4 py-2 rounded border-2 bg-black hover:bg-blue-500"
>
  Vista Desconocida
</button>
    </nav>
  );
};

export default Navbar;
