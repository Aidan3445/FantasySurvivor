import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import API from "./utils/api";
import GameData from "./utils/gameData";
import { removeLogin } from "./utils/miscUtils";
import "./App.css";

import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import SurvivorPage from "./pages/SurvivorPage";
import DataEntryPage from "./pages/DataEntryPage";
import DraftPage from "./pages/DraftPage";
import LoadingPage from "./pages/LoadingPage";
import Navbar from "./components/NavBarComp";

var root =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_ROOT
    : process.env.REACT_APP_API_ROOT_DEV;

function App() {
  var [loggedIn, setLoggedIn] = useState("");
  var [game, setGame] = useState(null);
  var [socket, setSocket] = useState(null);

  const handleLogin = (playerName) => {
    setLoggedIn(playerName);
    if (!playerName) removeLogin();
  };

  var api = new API();

  const updateGame = async () => {
    const res = await api.all().newRequest();
    socket?.emit("update", res);
    var g = new GameData(res);
    setGame(g);
  };

  socket?.on("update", (data) => {
    setGame(new GameData(data));
  });

  useEffect(() => {
    setSocket(io.connect(root));

    updateGame();

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
    if (!socket) return;
    updateGame();

    return () => socket.disconnect();
  }, [socket]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <div>
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
          <HomePage gameData={game} />
        </div>
      ),
    },
    {
      path: "/Player/:name",
      element: (
        <div>
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
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
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
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
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
          <DataEntryPage gameData={game} updateGameData={updateGame} />
        </div>
      ),
    },
    {
      path: "/Draft",
      element: (
        <div>
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
          <DraftPage loggedIn={loggedIn} />
        </div>
      ),
    },
  ]);

  if (!game) return <LoadingPage />;
  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
}

export default App;

function nameLoader({ params }) {
  return params.name;
}
