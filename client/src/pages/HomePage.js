import React, { useState } from "react";
import Game from "../utils/game";

import Scoreboard from "../components/ScoreboardComp";
import Chart from "../components/RechartChartComp";

export default function HomePage() {
  var [survivors, setSurvivors] = useState([]);
  var [players, setPlayers] = useState([]);
  var [episodes, setEpisodes] = useState([]);

  var [survivorData, setSurvivorData] = useState([]);
  var [playerData, setPlayerData] = useState([]);

  var [canvasIds, setCanvasIds] = useState({
    players: "noPlayers",
    survivors: "noSurvivors",
  });

  React.useEffect(() => {
    // can optimize this by making one call to a better helper method
    Game.getEpisodes().then((episodes) => {
      setEpisodes(episodes);
    });

    Game.getPlayers().then((players) => {
      var sortedPlayers = players.sort(
        (a, b) => b.stats.points - a.stats.points
      );
      setPlayers(sortedPlayers);
      setPlayerData(getData([], sortedPlayers));
    });

    Game.getSurvivors().then((survivors) => {
      var sortedSurvivors = survivors.sort(
        (a, b) => b.stats.points - a.stats.points
      );
      setSurvivors(sortedSurvivors);
      setSurvivorData(getData([], sortedSurvivors));
    });

    // used for old CanvasChart
    // Game.DelayedChart("playerCanvas", "survivorCanvas").then((ids) => {
    //   setCanvasIds(ids);
    // });
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
      <div>
        <div className="survivor-header">Players</div>
        <Scoreboard
          headers={playerHeaders}
          entries={playerEntries}
          handleSelect={handlePlayerSelect}
        />
        <Chart canvasId={canvasIds.players} data={playerData} />
      </div>
      <div>
        <div className="survivor-header">Survivors</div>
        <Scoreboard
          headers={survivorHeaders}
          entries={survivorEntries}
          handleSelect={handleSurvivorSelect}
        />
        <Chart canvasId={canvasIds.survivors} data={survivorData} />
      </div>
      <div>
        <div className="survivor-header">Eliminations</div>
        <Scoreboard headers={eliminationHeaders} entries={eliminationEntries} />
      </div>
    </div>
  );
}
