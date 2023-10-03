import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "./fantasy/game";
import "./App.css";

import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import SurvivorPage from "./pages/SurvivorPage";
import DataEntryPage from "./pages/DataEntryPage";
import DraftPage from "./pages/DraftPage";
import Navbar from "./components/NavBarComp";

function App() {
  var [loggedIn, setLoggedIn] = useState("");

  const handleLogin = (playerName) => {
    setLoggedIn(playerName);
    if (!playerName) Game.removeLogin();
  };

  useEffect(() => {
    if (loggedIn) return;
    Game.autoLogin().then((res) => {
      if (res.accepted) {
        setLoggedIn(res.accepted);
      }
    });
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <div>
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
          <HomePage />
        </div>
      ),
    },
    {
      path: "/Player/:name",
      element: (
        <div>
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
          <PlayerPage loggedIn={loggedIn} setLoggedIn={handleLogin} />
        </div>
      ),
      loader: nameLoader,
    },
    {
      path: "/Survivor/:name",
      element: (
        <div>
          <Navbar loggedIn={loggedIn} setLoggedIn={handleLogin} />
          <SurvivorPage />
        </div>
      ),
      loader: nameLoader,
    },
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

  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
}

export default App;

function nameLoader({ params }) {
  return params.name;
}
