import React, { useState, useEffect } from "react";
import LoginWithCarouselAPI from "./components/LoginWithCarouselAPI";
import GameList from "./components/GameList";
import Header from "./components/Header";
import GameDetail from "./components/GameDetail";
import axios from "axios";
import "./styles.css";
//hola
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null); 
  const [cart, setCart] = useState([]);
  const [library, setLibrary] = useState([]);


  // ACA RECUPERAMOS DATOS DEL LOCALSTORAGE-- NO ME LO TOQUES PLS
  
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
  
      //MODIFCAR CUANDO TENGAMOS LOS ROLES
      const userWithBalance = {
        ...storedUser,
        wishlist: storedWishlist,
        balance: storedUser.balance ?? 500, 
      };
  
      setCurrentUser(userWithBalance);
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


  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/games");
        const fetchedGames = response.data;
        localStorage.setItem("games", JSON.stringify(fetchedGames));
        setGames(fetchedGames);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener juegos desde el backend:", error);
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


  // YA ARREGLE EL LOGOUT QUE HABLAMOS, PROBALO

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
  };

  const handleCloseDetail = () => {
    setSelectedGame(null);
  };

  const addToWishlist = (game) => {
    if (currentUser) {
      const updatedWishlist = [...(currentUser.wishlist || []), game];
      setCurrentUser({ ...currentUser, wishlist: updatedWishlist });
    }
  };

  const removeFromWishlist = (gameToRemove) => {
    if (currentUser) {
      const updatedWishlist = currentUser.wishlist.filter(
        (g) => g.id !== gameToRemove.id
      );
      setCurrentUser({ ...currentUser, wishlist: updatedWishlist });
    }
  };


  const addToCart = (game) => {
    if (!cart.some((g) => g.id === game.id)) {
      setCart([...cart, { ...game }]);
    }
  };

  const removeFromCart = (gameToRemove) => {
    setCart(cart.filter((g) => g.id !== gameToRemove.id));
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
      localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify([]));
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
        <>
          <Header currentUser={currentUser} handleLogout={handleLogout} />

          {loading ? (
            <p className="text-center">Cargando juegos...</p>
          ) : selectedGame ? (
           
            <GameDetail
              game={selectedGame}
              addToCart={addToCart}
              setCurrentView={handleCloseDetail}
            />
          ) : (
          
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
        </>
      )}
    </div>
  );
};

export default App;
