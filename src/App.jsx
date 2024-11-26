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
  const [currentUser, setCurrentUser] = useState(null); // Usuario actual
  const [games, setGames] = useState([]); // Lista de juegos
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [currentView, setCurrentView] = useState("games"); // Vista actual
  const [selectedGame, setSelectedGame] = useState(null); // Juego seleccionado para detalles
  const [cart, setCart] = useState([]); // Carrito del usuario actual
  const [library, setLibrary] = useState([]);
  // Recuperar usuario, carrito, lista de deseos y biblioteca al cargar la aplicación
  const getLocalStorageData = (key) => {
    try {
      const data = localStorage.getItem(key);
      if (data === "undefined" || data === null) {
        return null; // Si el valor es "undefined" o null, retorna null.
      }
      return JSON.parse(data); // Intenta parsear si el valor es válido.
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return null; // Retorna null si ocurre un error.
    }
  };
  
  
  useEffect(() => {
    const storedUser = getLocalStorageData("currentUser");
    if (storedUser) {
      // Cargar wishlist, biblioteca y carrito específicos del usuario
      const storedWishlist = getLocalStorageData(`wishlist_${storedUser.username}`) || [];
      const storedLibrary = getLocalStorageData(`library_${storedUser.username}`) || [];
      const storedCart = getLocalStorageData(`cart_${storedUser.username}`) || [];
  
      // Sincronizar el estado solo para el usuario actual
      setCurrentUser({
        ...storedUser,
        wishlist: storedWishlist,
      });
      setLibrary(storedLibrary); // Biblioteca específica
      setCart(storedCart);       // Carrito específico
    } else {
      // Si no hay usuario almacenado, limpiar el estado
      setCurrentUser(null);
      setLibrary([]);
      setCart([]);
    }
  }, []);
  useEffect(() => {
    if (currentUser?.role === "admin") {
      // Para el administrador, limpia datos específicos de usuario
      setLibrary([]);
      setCart([]);
    }
  }, [currentUser]);
  // Sincronizar cambios del usuario, carrito y biblioteca con localStorage

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

  // Logout del usuario
  const handleLogout = () => {
    if (currentUser) {
      // Guardar los datos del usuario antes de limpiar
      localStorage.setItem(
        `wishlist_${currentUser.username}`,
        JSON.stringify(currentUser.wishlist || [])
      );
      localStorage.setItem(
        `library_${currentUser.username}`,
        JSON.stringify(library || [])
      );
      localStorage.setItem(
        `cart_${currentUser.username}`,
        JSON.stringify(cart || [])
      );
  
      // Limpiar estados y localStorage del usuario activo
      setCurrentUser(null);
  
      localStorage.removeItem("currentUser"); // Eliminar usuario actual
      alert("Sesión cerrada correctamente.");
    }
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

  // Mover juegos del carrito a la biblioteca
  const purchaseCart = () => {
    if (currentUser) {
      // Combina los juegos del carrito con la biblioteca actual
      const updatedLibrary = [...library, ...cart];
  
      // Actualiza el estado de la biblioteca y limpia el carrito
      setLibrary(updatedLibrary);
      setCart([]);
  
      // Guarda los datos actualizados en localStorage
      localStorage.setItem(
        `library_${currentUser.username}`,
        JSON.stringify(updatedLibrary)
      );
      localStorage.setItem(
        `cart_${currentUser.username}`,
        JSON.stringify([])
      );
  
      alert("Compra realizada con éxito. Los juegos están en tu biblioteca.");
    } else {
      alert("Debes iniciar sesión para realizar una compra.");
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
                currentUser={currentUser}
                cart={cart} // Pasa el estado del carrito
                setCart={setCart} // Pasa la función para actualizar el carrito
                library={library}
                setLibrary={setLibrary}
              
                addToWishlist={addToWishlist}
                removeFromWishlist={removeFromWishlist}
                  purchaseCart={purchaseCart}
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