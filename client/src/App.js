import React, { useEffect, useState, useRef } from "react";
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
import { fetchSeasons } from "./utils/miscUtils.js";

const root =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_ROOT
        : process.env.REACT_APP_API_ROOT_DEV;

function App() {
    const [loggedIn, setLoggedIn] = useState("");
    const [seasons, setSeasons] = useState({});
    const [game, setGame] = useState(null);
    const handleLogin = (playerName) => {
        setLoggedIn(playerName);
        if (!playerName) {
            removeLogin();
        }
    };

    const socket = useRef(io.connect(root));

    const api = new API();

    const getGame = async (season) => {
        const res = await api.get(season).newRequest();
        const g = new GameData(res);
        console.log(g);
        setGame(g);

        return g;
    };


    const updateGame = async (passedSeason) => {
        const season = passedSeason ||
            document.getElementById("season-select")?.innerText ||
            seasons.defaultSeason?.value;
        if (!season) {
            return;
        }

        getGame(season);
        socket.current.emit("update", season);
    };

    useEffect(() => {
        const getSeasons = async () => {
            const s = await fetchSeasons(setSeasons);
            setSeasons(s);
            getGame(s.defaultSeason?.value);
        };

        getSeasons();

        API.autoLogin()
            .then((res) => {
                if (res?.data?.login) {
                    handleLogin(res.data.player.name);
                }
            });

    }, []);

    useEffect(() => {
        if (!socket.current) {
            return;
        }

        socket.current.on("update", (season) => {
            if (season === document.getElementById("season-select")?.innerText) {
                getGame(season);
            }
        });


        return () => socket.current.disconnect();
    }, [socket]);


    const withLayout = (element) => {
        return (
            <div>
                <Navbar
                    loggedIn={loggedIn}
                    setLoggedIn={handleLogin}
                    seasons={seasons}
                    gameData={game}
                    getGame={getGame} />
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
                    updateGameData={updateGame}
                    loggedIn={loggedIn}
                />
            ),
        },
        {
            path: "/Draft",
            element: withLayout(
                <DraftPage loggedIn={loggedIn} gameData={game} updateGameData={updateGame} />
            ),
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
