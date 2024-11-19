import React from 'react';
import logo from '../assets/logo.jpg';
const Header = ({ currentUser, handleLogout }) => {
  return (
    <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
      {/* logo para la tienda */}
      <div className="flex items-center">
        <img src={logo} alt="Logo de la tienda" className="w-16 h-16 mr-4" />
        <h1 className="text-3xl font-bold">INFINITY GAMES</h1>
      </div>

      {/* Aca va el boton de cierre de sesion y un saludo para el usuario*/}
      <div className="flex items-center space-x-4">
        <p className="text-lg">
          Bienvenido, <span className="font-semibold">{currentUser.username}</span>
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;