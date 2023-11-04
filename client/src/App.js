import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import API from "./utils/api";
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

  const handleLogin = (playerName) => {
    setLoggedIn(playerName);
    if (!playerName) removeLogin();
  };

  useEffect(() => {
    if (loggedIn) return;
    new API().autoLogin().newRequest().then((res) => {
      if (res.login) {
        setLoggedIn(res.login.name);
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
