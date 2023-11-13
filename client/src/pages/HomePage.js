import React, { useState } from "react";
import GameData from "../utils/gameData";
import API from "../utils/api";

import Scoreboard from "../components/ScoreboardComp";
import Chart from "../components/RechartChartComp";

export default function HomePage() {
  var [survivors, setSurvivors] = useState([]);
  var [players, setPlayers] = useState([]);
  var [episodes, setEpisodes] = useState([]);

  var [survivorData, setSurvivorData] = useState([]);
  var [playerData, setPlayerData] = useState([]);

  React.useEffect(() => {
    new API()
      .all()
      .newRequest()
      .then((res) => {
        var gameData = new GameData(res);
        setEpisodes(gameData.episodes);

        setPlayers(gameData.players);
        setPlayerData(getData([], gameData.players));

        setSurvivors(gameData.survivors);
        setSurvivorData(getData([], gameData.survivors));
      });
  }, []);

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

  var playerEntries = players.map((player) => {
    return {
      data: [
        player.name,
        player.survivorList[player.survivorList.length - 1]?.name
          ? player.survivorList[player.survivorList.length - 1].name
          : "None",
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

  // Chart
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

  const handleSurvivorSelect = (selected, clickName) => {
    return handleSelect(
      selected,
      clickName,
      survivorEntries,
      survivors,
      setSurvivorData
    );
  };

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

  return (
    <div className="content centered">
      <br />
      <div className="box pad-5 marg-5">
        <div className="survivor-header">Players</div>
        <Scoreboard
          headers={playerHeaders}
          entries={playerEntries}
          handleSelect={handlePlayerSelect}
        />
        <Chart data={playerData} />
      </div>
      <div className="box pad-5 marg-5">
        <div className="survivor-header">Survivors</div>
        <Scoreboard
          headers={survivorHeaders}
          entries={survivorEntries}
          handleSelect={handleSurvivorSelect}
          multiPage
        />
        <Chart data={survivorData} />
      </div>
      <div className="box pad-5 marg-5">
        <div className="survivor-header">Eliminations</div>
        <Scoreboard headers={eliminationHeaders} entries={eliminationEntries} />
      </div>
    </div>
  );
}
