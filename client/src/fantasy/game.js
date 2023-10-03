import axios from "axios";
import Episode from "./episode";
import tinyColor from "tinycolor2";

const apiRoot =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_ROOT
    : process.env.REACT_APP_API_ROOT_DEV;

class Game {
  //#region READ DATA */
  // get all episodes as an array
  static async getEpisodes() {
    return axios
      .get(`${apiRoot}episodes`)
      .then((res) => res.data.map((ep) => Episode.fromJSON(ep)))
      .catch((err) => console.log(err));
  }

  // get survivor by name
  static async getSurvivor(survivorName) {
    return this.getSurvivorHelper(`survivor/${survivorName}`).then(
      (survivorArr) => survivorArr.pop()
    );
  }

  // get all survivors as an array
  // also get points for each survivor
  static async getSurvivors() {
    return this.getSurvivorHelper("survivors");
  }

  static async getSurvivorHelper(request) {
    return axios
      .get(`${apiRoot}${request}`)
      .then((res) => res.data)
      .then(async (survivors) => {
        const episodes = await this.getEpisodes();
        const tribes = await this.getTribes();
        return survivors.map((survivor) => {
          survivor.stats = this.survivorStats(survivor, episodes);
          survivor.color = tribes.find(
            (tribe) => tribe.name === survivor.tribe
          ).color;
          return survivor;
        });
      });
  }

  static survivorStats(survivor, episodes) {
    var { name, tribe } = survivor;

    var stats = {
      points: 0,
      ppe: 0,
      wins: 0,
      indivWins: 0,
      tribeWins: 0,
      eliminated: 0,
      episodeTotals: [],
    };

    var airedCount = 0;

    episodes
      .filter((episode) => episode.aired >= 0)
      .forEach((episode) => {
        var points = episode.getPoints(survivor);

        stats.points += points;
        stats.episodeTotals.push(points);

        var indivWins = episode.indivWins.filter((val) => val === name);
        stats.indivWins += indivWins.length;
        stats.wins += indivWins.length;

        var tribeWins = episode.tribe1sts.filter(
          (val) => val === name || val === tribe
        );
        stats.tribeWins += tribeWins.length;
        stats.wins += tribeWins.length;

        stats.eliminated = episode.eliminated.includes(name)
          ? episode.number
          : stats.eliminated;

        if (episode.aired === 1) airedCount++;
      });

    stats.ppe = stats.points / airedCount;

    stats.episodeTotals = this.getRunningPoints(stats.episodeTotals);

    return stats;
  }

  // get player by name
  static async getPlayer(playerName) {
    return this.getPlayerHelper(`player/${playerName}`).then((playerArr) => {
      return playerArr.pop();
    });
  }

  // get all players as an array
  static async getPlayers() {
    return this.getPlayerHelper("players");
  }

  static async getPlayerHelper(request) {
    return axios
      .get(`${apiRoot}${request}`)
      .then((res) => res.data)
      .then(async (players) => {
        const episodes = await this.getEpisodes();
        const survivors = await this.getSurvivors();
        const bets = await this.getSideBets();
        return players.map((player) => {
          var survivorList = player.survivorList.map((survivorName) => {
            return survivors.find((survivor) => survivor.name === survivorName);
          });
          player.survivorList = survivorList;
          player.stats = this.playerStats(player, episodes, bets);
          return player;
        });
      })
      .catch((err) => console.log(err));
  }

  static playerStats(player, episodes, bets) {
    var survivors = player.survivorList;
    var stats = {
      points: 0,
      survivalPoints: 0,
      performancePoints: 0,
      ppe: 0,
      episodeTotals: [],
      performanceByEp: [],
      survivalByEp: [],
      highestScorer: { name: "", points: 0 },
      betHits: 0,
      survivorCount: 0,
      airedCount: 0,
      needsSurvivor: false,
    };

    var survivorScores = [];
    var survivalPoints = 0;
    for (
      var i = 0;
      i < episodes.findLastIndex((episode) => episode.aired >= 0) + 1;
      i++
    ) {
      var survivor = survivors[i];
      if (!survivor) {
        stats.needsSurvivor = true;
        continue;
      }

      var episode = episodes[i];

      var performancePoints = episode.getPoints(survivor);
      stats.performancePoints += performancePoints;
      stats.performanceByEp.push(performancePoints);

      if (episode.eliminated.includes(survivor.name) || episode.aired === -1) {
        survivalPoints = 0;
      } else {
        survivalPoints += 1;
      }
      stats.survivalPoints += survivalPoints;
      stats.survivalByEp.push(survivalPoints);

      var episodePoints = performancePoints + survivalPoints;

      stats.points += episodePoints;
      stats.episodeTotals.push(episodePoints);

      var scorerIndex = survivorScores.findIndex(
        (scorer) => scorer.name == survivor.name
      );
      if (scorerIndex != -1) {
        survivorScores[scorerIndex].points += performancePoints;
      } else {
        survivorScores.push({ name: survivor.name, points: performancePoints });
      }

      if (episode.aired === 1) stats.airedCount++;
    }

    if (survivors.length > 0) {
      stats.ppe = stats.points / stats.airedCount;

      stats.survivorCount = survivorScores.length;

      stats.highestScorer = survivorScores.reduce(
        (highest, scorer) => {
          if (scorer.points > highest.points) {
            return scorer;
          }
          return highest;
        },
        { name: "", points: 0 }
      );

      stats.episodeTotals = this.getRunningPoints(stats.episodeTotals);
    }

    Object.keys(bets).forEach((bet) => {
      if (bets[bet].length === 0) return;

      bets[bet].forEach((hits) => {
        if (hits.names.includes(player.draft[bet])) {
          stats.points += 10;
          stats.episodeTotals.forEach((_, i) => {
            if (i >= hits.episodeIndex) {
              stats.episodeTotals[i] += 10;
            }
          });
          stats.betHits++;
        }
      });
    });
    return stats;
  }

  // login player
  static async login(playerName, password) {
    if (!playerName || !password) {
      return { rejected: "Please enter a player name and/or password." };
    }

    return axios
      .get(`${apiRoot}player/${playerName}/login/${password}`)
      .then((res) => {
        if (res.data && res.data.name === playerName) {
          return { accepted: playerName };
        }
        return {
          rejected: `Player name and password do not match. 
        Please try again or contact Aidan if you forgot your password.`,
        };
      })
      .catch((err) => console.log(err));
  }

  // get tribe by name
  static async getTribe(tribeName) {
    return axios
      .get(`${apiRoot}tribe/${tribeName}`)
      .then((res) => res.data[0])
      .catch((err) => console.log(err));
  }

  // get tribeColor by name
  static async getTribeColor(tribeName) {
    return this.getTribe(tribeName).then((tribe) => {
      return tribe.color;
    });
  }

  // get all tribes as an array
  static async getTribes() {
    return axios
      .get(`${apiRoot}tribes`)
      .then((res) => res.data)
      .catch((err) => console.log(err));
  }

  // get the available survivors
  static async getAvailableSurvivors() {
    return this.getSurvivors().then(async (survivors) => {
      const players = await this.getPlayers();
      return this.availableSurvivorsHelper(survivors, players);
    });
  }

  static availableSurvivorsHelper(survivors, players) {
    var availableSurvivors = survivors.filter((survivor) => {
      return (
        survivor.stats.eliminated === 0 &&
        !players.some((player) => {
          var currentSurvivor =
            player.survivorList[player.survivorList.length - 1];
          if (!currentSurvivor) currentSurvivor = { name: "_" };
          return (
            !player.stats.needsSurvivor &&
            currentSurvivor.name === survivor.name
          );
        })
      );
    });

    return availableSurvivors.map((survivor) => ({
      value: survivor.name,
      label: survivor.name,
      survivor: survivor,
    }));
  }

  // get name lists for menu dropdown
  static async getMenuValues() {
    return this.getSurvivors().then(async (survivors) => {
      const players = await this.getPlayers();
      return {
        Survivors: survivors.map((survivor) => ({
          value: survivor.name,
          label: survivor.name,
        })),
        Players: players.map((player) => ({
          value: player.name,
          label: player.name,
        })),
      };
    });
  }

  // get name lists for data entry dropdowns
  static async getDataEntryValues() {
    return this.getSurvivors().then(async (survivors) => {
      const episodes = await this.getEpisodes();
      return {
        Survivors: survivors.map((survivor) => ({
          value: survivor.name,
          label: survivor.name,
          survivor: survivor,
        })),
        Tribes: survivors.reduce((list, surv) => {
          if (!list.some((opt) => opt.value === surv.tribe)) {
            list.push({
              value: surv.tribe,
              label: surv.tribe,
            });
          }
          return list;
        }, []),
        Episodes: episodes
          .map((episode) => ({
            value: episode.number,
            label: `${episode.number}: ${episode.title} (${
              episode.aired === 1
                ? "Aired"
                : episode.aired === 0
                ? "Airing"
                : "Not Aired"
            })`,
            episode: episode,
          }))
          .concat({ value: 0, label: "New Episode", episode: null }),
      };
    });
  }

  // get values for draft page
  static async getDraftValues() {
    return this.getSurvivors().then(async (survivors) => {
      const players = await this.getPlayers();
      return {
        Survivors: survivors.map((survivor) => ({
          value: survivor.name,
          label: survivor.name,
          survivor: survivor,
        })),
        Tribes: survivors.reduce((list, surv) => {
          if (!list.some((opt) => opt.value === surv.tribe)) {
            list.push({
              value: surv.tribe,
              label: surv.tribe,
            });
          }
          return list;
        }, []),
        AvailableSurvivors: this.availableSurvivorsHelper(survivors, players),
        DraftOrder: players
          .sort((p1, p2) => p1.draft.order - p2.draft.order)
          .map((player) => ({
            value: player.name,
            label: player.name,
            player: player,
          })),
      };
    });
  }

  // get side bet outcomes
  static async getSideBets() {
    return this.getEpisodes().then(async (episodes) => {
      var players = await axios
        .get(`${apiRoot}players`)
        .then((res) => res.data);
      return this.getSideBetsHelper(episodes, players);
    });
  }

  static async getSideBetsHelper(episodes, players) {
    var firstBoot = [],
      firstJurror = [],
      winner = [],
      mostAdvantages = [],
      mostIndividualImmunities = [],
      firstLoser = [];

    var advCounter = {};
    var indivImmCounter = {};

    episodes.forEach((episode) => {
      if (episode.eliminated.length > 0) {
        if (episode.number === 1) {
          firstBoot = [{ episodeIndex: 0, names: episode.eliminated }];
        }
        if (episode.merged) {
          firstJurror = [
            { episodeIndex: episode.number - 1, names: episode.eliminated },
          ];
        }
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

      if (firstLoser.length > 0) return;
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
      console.log(most[0]);
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
        var mostCount = most[0] ? indivImmCounter[most[0]].count : 1;
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
      mostAdvantages: mostAdvantages,
      mostIndividualImmunities: mostIndividualImmunities,
      firstLoser,
    };
  }

  // get running point total
  static getRunningPoints(episodePoints) {
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
  //#endregion

  //#region WRITE DATA
  // add new episode
  static async AddEpisode(newEpisode) {
    return axios
      .post(`${apiRoot}episode/new`, newEpisode)
      .catch((err) => console.log(err));
  }

  // update episode
  static async UpdateEpisode(updatedEpisode) {
    return axios
      .post(`${apiRoot}episode/update`, updatedEpisode)
      .catch((err) => console.log(err));
  }

  // submit draft picks
  static async submitDraft(playerName, draftPicks) {
    return axios
      .post(`${apiRoot}player/${playerName}/draft`, draftPicks)
      .catch((err) => console.log(err));
  }

  // update player survivor pick
  static async updateSurvivorPick(playerName, survivorName) {
    return axios
      .post(`${apiRoot}player/${playerName}/changesurvivor/${survivorName}`)
      .catch((err) => console.log(err));
  }

  // update player password
  static async updatePassword(playerName, newPassword, confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
      return "Passwords do not match";
    }
    if (newPassword.length < 3) {
      return "Password must be at least 3 characters";
    }

    return axios
      .post(`${apiRoot}player/${playerName}/password`, {
        newPassword,
      })
      .then(() => "success")
      .catch((err) => console.log(err));
  }

  // update player color
  static async updateColor(playerName, newColor) {
    return axios
      .post(`${apiRoot}player/${playerName}/color`, {
        newColor,
      })
      .catch((err) => console.log(err));
  }

  // save login safely
  static saveLogin(playerName, password) {
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("password", password);
  }

  // remove login safely
  static removeLogin() {
    localStorage.removeItem("playerName");
    localStorage.removeItem("password");
  }

  // attempt to login with saved credentials
  static async autoLogin() {
    var playerName = localStorage.getItem("playerName");
    var password = localStorage.getItem("password");
    if (playerName && password) {
      return this.login(playerName, password);
    }
    return { rejected: "No saved credentials" };
  }
  //#endregion

  //#region UTILS
  // delay function for canvas fonts to load
  static async DelayedChart(playerId, survivorId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ players: playerId, survivors: survivorId });
      }, 10);
    });
  }

  // determine if a color is light or dark
  static isLightColor(color) {
    return tinyColor(color).isLight();
  }
  //#endregion
}

export default Game;
