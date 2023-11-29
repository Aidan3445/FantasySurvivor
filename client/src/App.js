import React, { useEffect, useState } from "react";
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
import Navbar from "./components/NavBarComp";

function App() {
  var [loggedIn, setLoggedIn] = useState("");
  var [game, setGame] = useState(null);

  const handleLogin = (playerName) => {
    setLoggedIn(playerName);
    if (!playerName) removeLogin();
  };

  var api = new API();

  const updateGame = () => {
    api
      .all()
      .newRequest()
      .then((res) => {
        setGame(new GameData(res));
      });
  };

  useEffect(() => {
    if (loggedIn) return;

    api
      .autoLogin()
      .newRequest()
      .then((res) => {
        if (res.login) {
          setLoggedIn(res.login.name);
        }
      });

    updateGame();
  }, []);

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
          <DataEntryPage />
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

  if (!game) return <div>Loading...</div>;
  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
}

export default App;

function nameLoader({ params }) {
  return params.name;
}
