import React, { useState, useEffect } from "react";
import LoginWithCarouselAPI from "./components/LoginWithCarouselAPI";
import GameList from "./components/GameList";
import Wishlist from "./components/Wishlist";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import GameDetail from "./components/GameDetail";
import axios from "axios";
import "./styles.css";
import NotFound from "./components/Notfound";

const App = () => {
  const [currentUser, setCurrentUser] = useState({
    wishlist: [],
    library: [],
  });
  const [games, setGames] = useState([]); // Lista de juegos
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [currentView, setCurrentView] = useState("games"); // Vista actual
  const [selectedGame, setSelectedGame] = useState(null); // Juego seleccionado para detalles
  const [cart, setCart] = useState([]); // Carrito del usuario actual

  // Recuperar usuario, carrito, lista de deseos y biblioteca al cargar la aplicación
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${storedUser.username}`)) || [];
      const storedLibrary = JSON.parse(localStorage.getItem(`library_${storedUser.username}`)) || [];
      const storedCart = JSON.parse(localStorage.getItem(`cart_${storedUser.username}`)) || [];
  
      setCurrentUser({
        ...storedUser,
        wishlist: Array.isArray(storedWishlist) ? storedWishlist : [], // Asegura que sea un array
        library: Array.isArray(storedLibrary) ? storedLibrary : [],   // Asegura que sea un array
      });
      setCart(Array.isArray(storedCart) ? storedCart : []); // Inicializa carrito como array
    }
    
  }, []);

  // Sincronizar cambios del usuario, carrito y biblioteca con localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem(
        `wishlist_${currentUser.username}`,
        JSON.stringify(currentUser.wishlist || [])
      );
      localStorage.setItem(
        `library_${currentUser.username}`,
        JSON.stringify(currentUser.library || [])
      );
      localStorage.setItem(
        `cart_${currentUser.username}`,
        JSON.stringify(cart || []));
    }
  }, [currentUser, cart]);

  // Fetch de la API para obtener los juegos
  useEffect(() => {
    const fetchGames = async () => {
      const page = 1;
      const pageSize = 40;
      try {
        const response = await axios.get(
          `https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965&page=${page}&page_size=${pageSize}`
        );
        const fetchedGames = response.data.results;

        // Guardamos los juegos en localStorage
        localStorage.setItem("games", JSON.stringify(fetchedGames));
        setGames(fetchedGames);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener juegos:", error);
        setLoading(false);
      }
    };

    // Intentamos cargar los juegos desde localStorage primero
    const storedGames = JSON.parse(localStorage.getItem("games"));
    if (storedGames) {
      setGames(storedGames);
      setLoading(false);
    } else {
      fetchGames();
    }
  }, []);

  // logout del usuario
  const handleLogout = () => {
    if (currentUser) {
      // Guardar la lista de deseos, biblioteca y carrito antes de salir, solo si existen
      if (currentUser.wishlist) {
        localStorage.setItem(
          `wishlist_${currentUser.username}`,
          JSON.stringify([...currentUser.wishlist])
        );
      }
  
      if (currentUser.library) {
        localStorage.setItem(
          `library_${currentUser.username}`,
          JSON.stringify([...currentUser.library])
        );
      }
  
      if (cart && cart.length > 0) {
        localStorage.setItem(
          `cart_${currentUser.username}`,
          JSON.stringify([...cart])
        );
      }
    }
  
    // Restablecer el estado
    setCurrentUser(null);
    setCart([]); // Reiniciar carrito al cerrar sesión
    localStorage.removeItem("currentUser");
  };

  // Manejar cambio de vista a detalles de un juego
  const handleGameClick = (game) => {
    setSelectedGame(game);
    setCurrentView("gameDetail");
  };

  // Volver a la vista de juegos
  const handleBackToGames = () => {
    setCurrentView("games");
    setSelectedGame(null);
  };

  // Volver a la lista de deseos
  const handleBackToWishlist = () => {
    setCurrentView("wishlist");
    setSelectedGame(null);
  };

  // Agregar un juego a la lista de deseos
  const addToWishlist = (game) => {
    if (currentUser) {
      const updatedWishlist = [...(currentUser.wishlist || []), game];
      const updatedUser = { ...currentUser, wishlist: updatedWishlist };

      setCurrentUser(updatedUser);
    }
  };

  // Eliminar un juego de la lista de deseos
  const removeFromWishlist = (gameToRemove) => {
    if (currentUser) {
      const updatedWishlist = currentUser.wishlist.filter(
        (game) => game.id !== gameToRemove.id
      );
      const updatedUser = { ...currentUser, wishlist: updatedWishlist };

      setCurrentUser(updatedUser);
    }
  };

  // Agregar un juego al carrito
  const addToCart = (game) => {
   
    if (cart.some((g) => g.id === game.id)) return;

    setCart([...cart, { ...game }]);
  };

  // Eliminar un juego del carrito
  const removeFromCart = (gameToRemove) => {
    setCart(cart.filter((game) => game.id !== gameToRemove.id));
  };

  // mover a biblioteca
  const purchaseCart = () => {
    if (currentUser) {
      const updatedLibrary = [...(currentUser.library || []), ...cart];
      const updatedUser = { ...currentUser, library: updatedLibrary };

      setCurrentUser(updatedUser);
      setCart([]); 
    }
  };

  return (
    <div className="min-h-screen text-white">
      {!currentUser ? (
        <LoginWithCarouselAPI setCurrentUser={setCurrentUser} />
      ) : (
        <div>
          <Header currentUser={currentUser} handleLogout={handleLogout} />
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            setSelectedGame={setSelectedGame}
            handleBackToGames={handleBackToGames}
            handleBackToWishlist={handleBackToWishlist}
          />
          {loading ? (
            <p className="text-center">Cargando juegos...</p>
          ) : (
            <>
              {currentView === "games" && (
                <GameList
                  games={games}
                  addToWishlist={addToWishlist}
                  addToCart={addToCart}
                  onGameClick={handleGameClick}
                  currentUser={currentUser}
                />
              )}
              {currentView === "wishlist" && (
                <Wishlist
                  currentUser={currentUser}
                  removeFromWishlist={removeFromWishlist}
                  setSelectedGame={handleGameClick}
                />
              )}
              {currentView === "gameDetail" && selectedGame && (
                <GameDetail
                  game={selectedGame}
                  addToCart={addToCart}
                  setCurrentView={handleBackToGames}
                />
              )}
              {!["games", "wishlist", "gameDetail"].includes(currentView) && (
                <NotFound />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;