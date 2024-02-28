import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useLoaderData, useNavigate } from "react-router-dom";
import GameData from "../utils/gameData";
import PlayerStats from "../components/PlayerStatsComp";
import SideBets from "../components/SideBetsComp";
import Scoreboard from "../components/ScoreboardComp";
import PlayerEdit from "../components/PlayerEditComp";
import Episodes from "../components/EpisodesComp";
import WindowContext from "../components/WindowContext";

export default function PlayerPage(props) {
    var { loggedIn, setLoggedIn, gameData, updateGameData, playerName } = props;

    PlayerPage.propTypes = {
        loggedIn: PropTypes.string.isRequired,
        setLoggedIn: PropTypes.func.isRequired,
        gameData: PropTypes.instanceOf(GameData).isRequired,
        updateGameData: PropTypes.func.isRequired,
        playerName: PropTypes.string,
    };

    const { smallScreen, mediumScreen, largeScreen } = useContext(WindowContext);

    var loadedPlayer = useLoaderData();
    playerName = playerName || loadedPlayer;
    var [player, setPlayer] = useState(gameData.playerByName(playerName));

    useEffect(() => {
        setPlayer(gameData.playerByName(playerName));
    }, [playerName, gameData]);

    var episodes = gameData.episodes;
    var currentSurvivor = player.survivors[player.survivors.length - 1];
    if (currentSurvivor?.stats?.eliminated) {
        episodes = episodes.slice(0, currentSurvivor.stats.eliminated);
    }

    var betOutcomes = gameData.sideBets;

    const navigate = useNavigate();
    useEffect(() => {
        if (loggedIn === playerName && player.survivors.length === 0) {
            navigate(`/Draft`);
        }
    }, [player, loggedIn, playerName, navigate]);

    var episodeHeaders =
        !largeScreen || (mediumScreen && !smallScreen)
            ? [
                "Episode",
                "Survivor",
                "Performance Points",
                "Survival Points",
                "Episode Total",
                "Season Total",
            ]
            : ["Ep", "Survivor", "Perf", "Surv", "Ep Total", "Szn Total"];

    var episodeEntries =
        player.survivors && player.stats && !player.stats.needsSurvivor
            ? player.survivors.map((survivor, index) => {
                if (!survivor)
                    return {
                        data: ["Choose Survivor", null, null, null, null],
                        color: "grey",
                    };

                if (
                    index > gameData.lastAired + 1 ||
                    (survivor.stats.eliminated && survivor.stats.eliminated <= index)
                )
                    return null;

                var performancePoints = player.stats.performanceByEp[index];
                var survivalPoints = player.stats.survivalByEp[index];
                var total = player.stats.episodeTotals[index];
                return {
                    data: [
                        survivor.name,
                        performancePoints,
                        survivalPoints,
                        performancePoints + survivalPoints,
                        total,
                    ],
                    color: survivor.stats.tribeList.findLast(
                        (update) => update.episode <= index
                    ).color,
                    eliminated: survivor.stats.eliminated === index + 1,
                };
            })
            : [];
    episodeEntries = episodeEntries.filter((entry) => entry);
    episodeEntries = episodeEntries.concat(
        !mediumScreen
            ? new Array(13 - episodeEntries.length).fill({
                data: ["", null, null, null, null],
                color: "grey",
            })
            : []
    );

    return (
        <div className="content">
            <br />
            {player.name && (
                <PlayerEdit
                    player={player}
                    updateGameData={updateGameData}
                    gameData={gameData}
                    loggedIn={loggedIn}
                    setLoggedIn={setLoggedIn}
                />
            )}
            <section className="player-info">
                <div
                    className={`stats-bets gap-0 ${loggedIn === playerName ? "cols" : ""
                        }`}
                >
                    {player.stats && (
                        <PlayerStats stats={player.stats} color={player.color} />
                    )}
                    {player.draft &&
                        (loggedIn === playerName || gameData.episodes.last().lastEp) && (
                            <SideBets
                                bets={player.draft}
                                outcomes={betOutcomes}
                                betHits={player.stats.betHits}
                                color={player.color}
                            />
                        )}
                </div>
                <div className="box centered pad-5 marg-5">
                    <div className="survivor-header">Episodes</div>
                    <br />
                    <Scoreboard headers={episodeHeaders} entries={episodeEntries} />
                </div>
            </section>
            <Episodes episodes={episodes} player={player} />
        </div>
    );
}
