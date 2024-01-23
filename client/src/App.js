import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import API from "./utils/api.js";
import GameData from "./utils/gameData.js";
import { removeLogin } from "./utils/miscUtils.js";
import "./App.css";
import HomePage from "./pages/HomePage.js";
import PlayerPage from "./pages/PlayerPage.js";
import SurvivorPage from "./pages/SurvivorPage.js";
import DataEntryPage from "./pages/DataEntryPage.js";
import DraftPage from "./pages/DraftPage.js";
import LoadingPage from "./pages/LoadingPage.js";
import Navbar from "./components/NavBarComp.js";
import { WindowContextProvider } from "./components/WindowContext.js";

const root =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_ROOT
    : process.env.REACT_APP_API_ROOT_DEV;

function App() {
  const [loggedIn, setLoggedIn] = useState("");
  const [game, setGame] = useState(null);
  const [socket, setSocket] = useState(null);

  const handleLogin = (playerName) => {
    setLoggedIn(playerName);
    if (!playerName) {
      removeLogin();
    }
  };

  const api = new API();

  const updateGame = async () => {
    const res = await api.all().newRequest();
    socket?.emit("update", res);
    const g = new GameData(res);
    setGame(g);
  };

  socket?.on("update", (data) => {
    setGame(new GameData(data));
  });

  useEffect(() => {
    setSocket(io.connect(root));

    api
      .autoLogin()
      .newRequest()
      .then((res) => {
        if (res.login) {
          setLoggedIn(res.login.name);
        }
      });
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    updateGame();

    return () => socket.disconnect();
  }, [socket]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <div>
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={handleLogin}
            gameData={game}
          />
          <HomePage gameData={game} />
        </div>
      ),
    },
    {
      path: "/Player/:name",
      element: (
        <div>
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={handleLogin}
            gameData={game}
          />
          <PlayerPage
            loggedIn={loggedIn}
            setLoggedIn={handleLogin}
            gameData={game}
            updateGameData={updateGame}
          />
        </div>
      ),
      loader: nameLoader,
    },
    {
      path: "/Survivor/:name",
      element: (
        <div>
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={handleLogin}
            gameData={game}
          />
          <SurvivorPage gameData={game} />
        </div>
      ),
      loader: nameLoader,
    },
    // Pages below edit data and don't use the localized game data
    {
      path: "/DataEntry",
      element: (
        <div>
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={handleLogin}
            gameData={game}
          />
          <DataEntryPage gameData={game} updateGameData={updateGame} />
        </div>
      ),
    },
    {
      path: "/Draft",
      element: (
        <div>
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={handleLogin}
            gameData={game}
          />
          <DraftPage loggedIn={loggedIn} />
        </div>
      ),
    },
  ]);

  if (!game) {
    return <LoadingPage />;
  }

  return (
    <WindowContextProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </WindowContextProvider>
  );
}

export default App;

function nameLoader({ params }) {
  return params.name;
}
