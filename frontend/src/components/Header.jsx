import React from 'react';
import logo from '../assets/logo.jpg';
import '../assets/Header.css'; 

const Header = ({ currentUser, handleLogout }) => {
  return (
    <header className="header-container">
      <div className="header-logo-container">
        <img src={logo} alt="Logo de la tienda" className="header-logo" />
        <h1 className="header-title">INFINITY GAMES</h1>
      </div>

      <div className="header-user-container">
        
        <div className="header-top-row">
          <p className="header-welcome-text">
            Bienvenido, <span className="username">{currentUser.username}</span>
          </p>
          <button
            onClick={handleLogout}
            className="header-logout-button"
          >
            Cerrar Sesión
          </button>
        </div>

        
        <p className="header-balance-text">
          Saldo: <span className="balance">${currentUser.balance}</span>
        </p>
      </div>
    </header>
  );
};

export default Header;
