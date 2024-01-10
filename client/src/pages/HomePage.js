import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import GameData from "../utils/gameData";

import Scoreboard from "../components/ScoreboardComp";
import Chart from "../components/RechartChartComp";
import WindowContext from "../components/WindowContext";

export default function HomePage(props) {
  var { gameData } = props;

  HomePage.propTypes = {
    gameData: PropTypes.instanceOf(GameData).isRequired,
  };

  const { smallScreen } = useContext(WindowContext);

  const getData = (selectedNames, population) => {
    return population
      .map((member) => {
        return {
          draw:
            selectedNames.length === 0 || selectedNames.includes(member.name),
          data: member.stats.episodeTotals,
          color: member.color,
          name: member.name,
        };
      })
      .reverse();
  };

  var episodes = gameData.episodes;
  var players = gameData.players;
  var [playerData, setPlayerData] = useState(getData([], gameData.players));
  var survivors = gameData.survivors;

  // Scoreboard
  var playerHeaders = ["Rank", "Name", "Current Survivor", "Score"];
  var survivorHeaders = ["Rank", "Name", "Score"];
  var eliminationHeaders = ["Episode", "Eliminated"];

  var survivorEntries = survivors.map((survivor) => {
    return {
      data: [survivor.name, survivor.stats.points],
      color: survivor.color,
    };
  });
  var sliceAt = Math.ceil(survivorEntries.length / 2);

  var playerEntries = players.map((player) => {
    return {
      data: [
        player.name,
        player.survivorList[player.survivorList.length - 1]?.name || "None",
        player.stats.points,
      ],
      color: player.color,
    };
  });

  var eliminationEntries = episodes.reduce((acc, episode) => {
    return [
      ...acc,
      ...episode.eliminated.map((elimination) => {
        var s = survivors.find((survivor) => survivor.name === elimination);
        return {
          data: [elimination],
          color: s ? s.color : "white",
        };
      }),
    ];
  }, []);

  const handlePlayerSelect = (selected, clickName) => {
    return handleSelect(
      selected,
      clickName,
      playerEntries,
      players,
      setPlayerData
    );
  };

  const handleSelect = (selected, clickName, entries, members, setData) => {
    var newSelected = [];
    if (selected.includes(clickName)) {
      newSelected = selected.filter((name) => name !== clickName);
    } else {
      newSelected = [...selected, clickName];
    }
    if (!entries.some((entry) => !newSelected.includes(entry.data[0]))) {
      newSelected = [];
    }
    setData(getData(newSelected, members));
    return newSelected;
  };

  const getSurvivorScoreboard = () => {
    var slice = smallScreen ? survivorEntries.length : sliceAt;
    return (
      <div className="scoreboard-chart">
        <Scoreboard
          headers={survivorHeaders}
          entries={survivorEntries.slice(0, slice)}
        />
        {!smallScreen && (
          <Scoreboard
            headers={survivorHeaders}
            entries={survivorEntries.slice(sliceAt)}
          />
        )}
      </div>
    );
  };

  console.log(gameData.data.players);

  return (
    <div className="content centered">
      <br />
      <div className="box pad-5 marg-5">
        <div className="survivor-header">Players</div>
        <div className="scoreboard-chart">
          <Scoreboard
            headers={playerHeaders}
            entries={playerEntries}
            handleSelect={handlePlayerSelect}
          />
          <Chart data={playerData} />
        </div>
      </div>
      <div className="box pad-5 marg-5">
        <div className="survivor-header">Survivors</div>
        {getSurvivorScoreboard()}
      </div>
      <div className="box pad-5 marg-5">
        <div className="survivor-header">Eliminations</div>
        <Scoreboard headers={eliminationHeaders} entries={eliminationEntries} />
      </div>
    </div>
  );
}
