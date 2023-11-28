import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useLoaderData, useNavigate } from "react-router-dom";
import GameData from "../utils/gameData";
import { smallScreen, mediumScreen, largeScreen } from "../utils/screenSize";

import PlayerStats from "../components/PlayerStatsComp";
import SideBets from "../components/SideBetsComp";
import Scoreboard from "../components/ScoreboardComp";
import PlayerEdit from "../components/PlayerEditComp";
import Episodes from "../components/EpisodesComp";

export default function PlayerPage(props) {
  var { loggedIn, setLoggedIn, gameData, playerName } = props;

  PlayerPage.propTypes = {
    loggedIn: PropTypes.string.isRequired,
    setLoggedIn: PropTypes.func.isRequired,
    gameData: PropTypes.instanceOf(GameData).isRequired,
    playerName: PropTypes.string,
  };

  var loadedPlayer = useLoaderData();
  playerName = playerName || loadedPlayer;
  var [player, setPlayer] = useState(gameData.playerByName(playerName));

  useEffect(() => {
    setPlayer(gameData.playerByName(playerName));
  }, [playerName]);

  var episodes = gameData.episodes;
  var betOutcomes = gameData.betOutcomes.sideBets;

  const navigate = useNavigate();
  if (loggedIn === playerName && player.survivorList.length === 0) {
    navigate(`/Draft`);
  }

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
    player.survivorList && player.stats && !player.stats.needsSurvivor
      ? player.survivorList
          .map((survivor, index) => {
            if (!survivor)
              return {
                data: ["Choose Survivor", null, null, null, null],
                color: "grey",
              };

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
            };
          })
          .concat(
            !mediumScreen
              ? new Array(16 - player.survivorList.length).fill({
                  data: ["", null, null, null, null],
                  color: "grey",
                })
              : []
          )
      : [];

  return (
    <div className="content">
      <br />
      {player.name && (
        <PlayerEdit
          player={player}
          setPlayer={setPlayer}
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
        />
      )}
      <section className="player-info">
        <div className="stats-bets gap-0">
          {player.stats && (
            <PlayerStats stats={player.stats} color={player.color} />
          )}
          {player.draft &&
            (loggedIn === playerName || episodes.last().lastEp) && (
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
