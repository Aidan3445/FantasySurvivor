import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import GameData from "../utils/gameData";
import API from "../utils/api";

import PlayerStats from "../components/PlayerStatsComp";
import SideBets from "../components/SideBetsComp";
import Scoreboard from "../components/ScoreboardComp";
import PlayerEdit from "../components/PlayerEditComp";
import { EpisodeComp as Episode } from "../components/EpisodesComp";

export default function PlayerPage(props) {
  var { loggedIn, setLoggedIn, playerName } = props;
  var loadedPlayer = useLoaderData();
  playerName = playerName || loadedPlayer;

  var [episodes, setEpisodes] = useState([]);
  var [player, setPlayer] = useState({});
  var [episodeEntries, setEpisodeEntries] = useState([]);
  var [betOutcomes, setBetOutcomes] = useState({
    firstBoot: [],
    firstJurror: [],
    mostAdvantages: [],
    winner: [],
    mostIndividualImmunities: [],
    firstLoser: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    new API()
      .all()
      .newRequest()
      .then((res) => {
        var gameData = new GameData(res);
        setEpisodes(gameData.episodes);
        setBetOutcomes(gameData.sideBets);

        var player = gameData.playerByName(playerName);
        if (loggedIn === playerName && player.survivorList.length === 0) {
          navigate(`/Draft`);
        }
        setPlayer(player);
      });
  }, [playerName, loggedIn]);

  useEffect(() => {
    setEpisodeEntries(updateEntries());
  }, [player]);

  var episodeHeaders =
    window.innerWidth > 800
      ? [
          "Episode",
          "Survivor",
          "Performance Points",
          "Survival Points",
          "Episode Total",
          "Season Total",
        ]
      : ["Ep", "Survivor", "Perf", "Surv", "Ep Total", "Szn Total"];

  const updateEntries = () => {
    return player.survivorList && player.stats && !player.stats.needsSurvivor
      ? player.survivorList.map((survivor, index) => {
          if (!survivor) return { data: ["None", 0, 0, 0, 0], color: "grey" };

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
      : [];
  };

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
        <div className="flex-div gap-0">
          {player.stats && (
            <PlayerStats stats={player.stats} color={player.color} />
          )}
          {player.draft && loggedIn === playerName && (
            <SideBets bets={player.draft} outcomes={betOutcomes} />
          )}
        </div>
        <div className="box centered pad-5 marg-5">
          <div className="survivor-header">Episodes</div>
          <Scoreboard headers={episodeHeaders} entries={episodeEntries} />
        </div>
      </section>
      {episodes &&
        player.survivorList &&
        episodes.map((ep, index) => (
          <Episode
            key={index}
            episode={ep}
            survivor={player.survivorList[index]}
          />
        ))}
    </div>
  );
}
