import tinyColor from "tinycolor2";
import API from "./api";
import { nanoid } from "nanoid";

// get running point total
function getRunningPoints(episodePoints) {
  var runningPoints = episodePoints.reduce(
    (points, val) => {
      var last = points[points.length - 1];
      return points.concat(last + val);
    },
    [0]
  );
  runningPoints.shift();

  return runningPoints;
}

function sideBetOutcomes(players, episodes) {
  var firstBoot = [],
    firstJurror = [],
    winner = [],
    mostAdvantages = [],
    mostIndividualImmunities = [],
    firstLoser = [],
    eliminated = [];

  var advCounter = {};
  var indivImmCounter = {};

  episodes.forEach((episode) => {
    if (episode.eliminated.length > 0) {
      if (episode.number === 1) {
        firstBoot = [{ episodeIndex: 0, names: episode.eliminated }];
      }
      if (episode.merged) {
        firstJurror = [
          {
            episodeIndex: episode.number - 1,
            names: [episode.eliminated[episode.eliminated.length - 1]],
          },
        ];
      }
      eliminated = eliminated.concat(episode.eliminated);
    }

    if (episode.soleSurvivor.length > 0) {
      winner = [
        { episodeIndex: episode.number - 1, names: episode.soleSurvivor },
      ];
    }

    episode.advsFound.forEach((foundBy) => {
      if (advCounter[foundBy]) {
        advCounter[foundBy].episodeIndex = episode.number - 1;
        advCounter[foundBy].count++;
      } else {
        advCounter[foundBy] = {
          episodeIndex: episode.number - 1,
          count: 1,
        };
      }
    });

    episode.indivWins.forEach((wonBy) => {
      if (indivImmCounter[wonBy]) {
        indivImmCounter[wonBy].episodeIndex = episode.number - 1;
        indivImmCounter[wonBy].count++;
      } else {
        indivImmCounter[wonBy] = {
          episodeIndex: episode.number - 1,
          count: 1,
        };
      }
    });

    if (firstLoser.length > 0) {
      return;
    }
    episode.eliminated.forEach((eliminated) => {
      var losers = players.filter((player) =>
        player.survivorList[episode.number - 1]
          ? player.survivorList[episode.number - 1].name === eliminated
          : false
      );
      if (losers.length > 0) {
        firstLoser = [
          {
            episodeIndex: episode.number - 1,
            names: losers.map((loser) => loser.name),
          },
        ];
        return;
      }
    });
  });

  mostAdvantages = Object.keys(advCounter).reduce((most, survivor) => {
    var mostCount = most[0] ? advCounter[most[0].names[0]].count : 1;
    if (advCounter[survivor].count > mostCount) {
      return [
        {
          episodeIndex: advCounter[survivor].episodeIndex,
          names: [survivor],
        },
      ];
    }
    if (advCounter[survivor].count === mostCount) {
      return most.concat({
        episodeIndex: advCounter[survivor].episodeIndex,
        names: [survivor],
      });
    }
    return most;
  }, []);

  mostIndividualImmunities = Object.keys(indivImmCounter).reduce(
    (most, survivor) => {
      var mostCount = most[0] ? indivImmCounter[most[0].names[0]].count : 1;
      if (indivImmCounter[survivor].count > mostCount) {
        return [
          {
            episodeIndex: indivImmCounter[survivor].episodeIndex,
            names: [survivor],
          },
        ];
      }
      if (indivImmCounter[survivor].count === mostCount) {
        return most.concat({
          episodeIndex: indivImmCounter[survivor].episodeIndex,
          names: [survivor],
        });
      }
      return most;
    },
    []
  );

  return {
    firstBoot,
    firstJurror,
    winner,
    mostAdvantages,
    mostIndividualImmunities,
    firstLoser,
    eliminated,
  };
}

// delay function for canvas fonts to load
async function DelayedChart(playerId, survivorId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ players: playerId, survivors: survivorId });
    }, 10);
  });
}

// determine if a color is light or dark
function isLightColor(color) {
  return tinyColor(color).isLight();
}

// sort array of objects by a player or survivor's points
Array.prototype.memberSort = function () {
  return this.sort((a, b) => b.stats.points - a.stats.points);
};

// need to update this to store hashed password
// save login safely
function saveLogin(playerName) {
  var token = nanoid(32);
  localStorage.setItem("playerName", playerName);
  localStorage.setItem("rememberMeToken", token);
  API.remberMe(playerName, token);
}

// remove login safely
function removeLogin() {
  localStorage.removeItem("playerName");
  localStorage.removeItem("rememberMeToken");
}

export {
  getRunningPoints,
  sideBetOutcomes,
  DelayedChart,
  isLightColor,
  saveLogin,
  removeLogin,
};
