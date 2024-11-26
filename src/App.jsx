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
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("games");
  const [selectedGame, setSelectedGame] = useState(null); 
  const [cart, setCart] = useState([]); 
  const [library, setLibrary] = useState([]);


  //Recuperamos los datos
  const getLocalStorageData = (key) => {
    try {
      const data = localStorage.getItem(key);
      if (data === "undefined" || data === null) {
        return null;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return null;
    }
  };
  
  
  useEffect(() => {
    const storedUser = getLocalStorageData("currentUser");
    if (storedUser) {
      const storedWishlist = getLocalStorageData(`wishlist_${storedUser.username}`) || [];
      const storedLibrary = getLocalStorageData(`library_${storedUser.username}`) || [];
      const storedCart = getLocalStorageData(`cart_${storedUser.username}`) || [];
  

      setCurrentUser({
        ...storedUser,
        wishlist: storedWishlist,
      });
      setLibrary(storedLibrary);
      setCart(storedCart);
    } else {
      setCurrentUser(null);
      setLibrary([]);
      setCart([]);
    }
  }, []);


  useEffect(() => {
    if (currentUser) {

      localStorage.setItem(
        `wishlist_${currentUser.username}`,
        JSON.stringify(currentUser.wishlist || [])
      );
      if (currentUser.role !== "admin") {
        localStorage.setItem(
          `library_${currentUser.username}`,
          JSON.stringify(library || [])
        );
        localStorage.setItem(
          `cart_${currentUser.username}`,
          JSON.stringify(cart || [])
        );
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  }, [currentUser, library, cart]);

  //Obtener los juegos de la api
  useEffect(() => {
    const fetchGames = async () => {
      const page = 1;
      const pageSize = 40;
      try {
        const response = await axios.get(
          `https://api.rawg.io/api/games?key=0b6043ca10304ceb8d5fa64a76a75965&page=${page}&page_size=${pageSize}`
        );
        const fetchedGames = response.data.results;

        localStorage.setItem("games", JSON.stringify(fetchedGames));
        setGames(fetchedGames);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener juegos:", error);
        setLoading(false);
      }
    };


    const storedGames = JSON.parse(localStorage.getItem("games"));
    if (storedGames) {
      setGames(storedGames);
      setLoading(false);
    } else {
      fetchGames();
    }
  }, []);

  //Logout
  const handleLogout = () => {
    if (currentUser) {
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
  
      setCurrentUser(null);
  
      localStorage.removeItem("currentUser");
      alert("Sesión cerrada correctamente.");
    }
  };
  

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setCurrentView("gameDetail");
  };

  const handleBackToGames = () => {
    setCurrentView("games");
    setSelectedGame(null);
  };

  const handleBackToWishlist = () => {
    setCurrentView("wishlist");
    setSelectedGame(null);
  };

  const addToWishlist = (game) => {
    if (currentUser) {
      const updatedWishlist = [...(currentUser.wishlist || []), game];
      const updatedUser = { ...currentUser, wishlist: updatedWishlist };
      setCurrentUser(updatedUser);
    }
  };

  const removeFromWishlist = (gameToRemove) => {
    if (currentUser) {
      const updatedWishlist = currentUser.wishlist.filter(
        (game) => game.id !== gameToRemove.id
      );
      const updatedUser = { ...currentUser, wishlist: updatedWishlist };
      setCurrentUser(updatedUser);
    }
  };

  const addToCart = (game) => {
    if (cart.some((g) => g.id === game.id)) return;
    setCart([...cart, { ...game }]);
  };

  const removeFromCart = (gameToRemove) => {
    setCart(cart.filter((game) => game.id !== gameToRemove.id));
  };

  const purchaseCart = () => {
    if (currentUser) {
      const updatedLibrary = [...library, ...cart];
  
      setLibrary(updatedLibrary);
      setCart([]);
  
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
                cart={cart}
                setCart={setCart}
                library={library}
                setLibrary={setLibrary}
              
                addToWishlist={addToWishlist}
                removeFromWishlist={removeFromWishlist}
                  purchaseCart={purchaseCart}
                  onGameClick={handleGameClick}
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