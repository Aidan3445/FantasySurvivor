import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import Game from "../fantasy/game";

import PlayerStats from "../components/PlayerStatsComp";
import SideBets from "../components/SideBetsComp";
import Scoreboard from "../components/ScoreboardComp";
import SurvivorPage from "./SurvivorPage";
import PlayerEdit from "../components/PlayerEditComp";

export default function PlayerPage(props) {
  var { loggedIn, playerName } = props;
  var loadedPlayer = useLoaderData();
  playerName = playerName || loadedPlayer;

  var [player, setPlayer] = useState({});
  var [selectedSurvivor, setSelectedSurvivor] = useState("");
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
    // optimize this by making one call to a better helper method
    Game.getPlayer(playerName).then((player) => {
      if (loggedIn === playerName && player.survivorList.length === 0) {
        navigate(`/Draft`);
      }

      setPlayer(player);

      Game.getSideBets().then((bets) => {
        setBetOutcomes(bets);
      });
    });
  }, [playerName, loggedIn]);

  useEffect(() => {
    setEpisodeEntries(updateEntries());
  }, [player]);

  var episodeHeaders = [
    "Episode",
    "Survivor",
    "Performance Points",
    "Survival Points",
    "Episode Total",
    "Season Total",
  ];
  const updateEntries = () => {
    return player.survivorList && player.stats && !player.stats.needsSurvivor
      ? player.survivorList.map((survivor, index) => {
          if (!survivor)
            return { data: ["None", 0, 0, 0, 0], color: "grey" };

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
            color: survivor.color,
          };
        })
      : [];
  };

  const displaySurvivor = (selected, clickName) => {
    if (selected.includes(clickName)) {
      setSelectedSurvivor("");
      return [];
    }
    setSelectedSurvivor(clickName);
    return [clickName];
  };

  return (
    <div className="content">
      <div className="flex-div">
        <PlayerEdit player={player} setPlayer={setPlayer} loggedIn={loggedIn} />
        {player.stats && <PlayerStats stats={player.stats} />}
      </div>
      {player.draft && loggedIn === playerName && <SideBets bets={player.draft} outcomes={betOutcomes} />}
      <Scoreboard
        headers={episodeHeaders}
        entries={episodeEntries}
        handleSelect={displaySurvivor}
      />
      {selectedSurvivor ? (
        <SurvivorPage
          survivorName={selectedSurvivor}
          pickedEpisodes={player.survivorList
            .map((survivor) => {
              return survivor.name === selectedSurvivor;
            })
            .reverse()}
        />
      ) : (
        <div className="survivor-body">
          Click on a survivor&rsquo;s name on the scoreboard to display their
          point info.
        </div>
      )}
    </div>
  );
}
