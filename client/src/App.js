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
        const res = await api.get("Season 45").newRequest();
        socket?.emit("update", res);
        const g = new GameData(res);
        setGame(g);
    };

    const updateSeason = async (seasonTag) => { };

    socket?.on("update", (data) => {
        setGame(new GameData(data));
    });

    useEffect(() => {
        setSocket(io.connect(root));

        API.autoLogin()
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

    const withLayout = (element) => {
        return (
            <div>
                <Navbar
                    loggedIn={loggedIn}
                    setLoggedIn={handleLogin}
                    setSeason={updateSeason}
                    gameData={game} />
                {element}
            </div>
        );
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: withLayout(
                <HomePage gameData={game} setLoggedIn={handleLogin} />
            ),
        },
        {
            path: "/Player/:name",
            element: withLayout(
                <PlayerPage
                    loggedIn={loggedIn}
                    setLoggedIn={handleLogin}
                    gameData={game}
                    updateGameData={updateGame}
                />
            ),
            loader: nameLoader,
        },
        {
            path: "/Survivor/:name",
            element: withLayout(<SurvivorPage gameData={game} />),
            loader: nameLoader,
        },
        // Pages below edit data and don't use the localized game data
        {
            path: "/DataEntry",
            element: withLayout(
                <DataEntryPage
                    gameData={game}
                    updateGameData={updateGame}
                    loggedIn={loggedIn}
                />
            ),
        },
        {
            path: "/Draft",
            element: withLayout(<DraftPage loggedIn={loggedIn} />),
        },
    ]);

    if (!game) return <LoadingPage />;
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
