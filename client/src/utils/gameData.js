import Episode from "./episode";
import { getRunningPoints } from "./miscUtils";

class GameData {
  constructor(requestData) {
    this.rawData = requestData;
    this.data = {};
    this.epCalls = 0;
  }

  // process episode data
  get episodes() {
    if (!this.data.episodes) {
      this.data.episodes = this.rawData.episodeData.map((episode) =>
        Episode.fromJSON(episode)
      );
    }
    return this.data.episodes;
  }

  // process survivor data
  get survivors() {
    if (!this.data.survivors) {
      this.data.survivors = this.rawData.survivorData.map((survivor) => {
        survivor.stats = this.survivorStats(survivor);
        survivor.color = this.tribes.find(
          (tribe) => tribe.name === survivor.tribe
        ).color;
        return survivor;
      });
    }
    return this.data.survivors.memberSort();
  }

  survivorByName(name) {
    return this.survivors.find((survivor) => survivor.name === name);
  }

  // calculate survivor stats
  survivorStats(survivor) {
    var { name, tribe } = survivor;
    var stats = {
      points: 0,
      ppe: 0,
      wins: 0,
      indivWins: 0,
      tribeWins: 0,
      eliminated: 0,
      episodeTotals: [],
      tribeList: [
        {
          episode: 0,
          tribe: tribe,
          color: this.tribes.find((tribe) => tribe.name === survivor.tribe)
            .color,
        },
      ],
    };

    var airedCount = 0;

    this.episodes
      .filter((episode) => episode.aired >= 0)
      .forEach((episode) => {
        if (stats.eliminated) return;

        var tribeUpdate = episode.tribeUpdates.find((update) =>
          update.survivors.includes(name)
        );
        if (tribeUpdate) {
          stats.tribeList.push({
            episode: episode.number - 1,
            tribe: tribeUpdate.tribe,
            color: this.tribes.find((tribe) => tribe.name === tribeUpdate.tribe)
              .color,
          });
          survivor.tribe = tribeUpdate.tribe;
          tribe = tribeUpdate.tribe;
        }

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

    stats.episodeTotals = getRunningPoints(stats.episodeTotals);

    // if (name == "Katurah Topps") console.log(stats);
    return stats;
  }

  // process player data
  get players() {
    if (!this.data.players) {
      this.data.players = this.rawData.playerData.map((player) => {
        player.survivorList = player.survivorList.map((survivorName) => {
          return this.survivors.find(
            (survivor) => survivor.name === survivorName
          );
        });
        player.stats = this.playerStats(player);
        return player;
      });
    }

    return this.data.players.memberSort();
  }

  playerByName(name) {
    return this.players.find((player) => player.name === name);
  }

  playerStats(player) {
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

    var lastAired = this.episodes.findLastIndex(
      (episode) => episode.aired >= 0
    );
    var survivorScores = [];
    var survivalPoints = 0;
    for (var i = 0; i <= lastAired + 1; i++) {
      var episode = this.episodes[i];
      var survivor = survivors[i];
      if (i === lastAired + 1) {
        if (!survivor && episode && episode.aired === 1) {
          stats.needsSurvivor = true;
        }
        continue;
      }

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

      stats.episodeTotals = getRunningPoints(stats.episodeTotals);
    }

    if (
      lastAired === this.episodes.length - 1 &&
      this.episodes[lastAired].soleSurvivor.length > 0
    ) {
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
    }

    stats.ppe = stats.points / stats.airedCount || 0;

    return stats;
  }

  // get tribe by name
  get tribes() {
    if (!this.data.tribes) {
      this.data.tribes = this.rawData.tribeData;
    }

    return this.data.tribes;
  }

  // get the available survivors
  get availableSurvivors() {
    var availableSurvivors = this.survivors.filter((survivor) => {
      return (
        stats.eliminated === 0 &&
        !this.players.some((player) => {
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
  get menuValues() {
    return {
      Survivors: this.survivors.map((survivor) => ({
        value: survivor.name,
        label: survivor.name,
      })),
      Players: this.players.map((player) => ({
        value: player.name,
        label: player.name,
      })),
    };
  }

  // get name lists for data entry dropdowns
  get dataEntryValues() {
    return {
      Survivors: this.survivors.map((survivor) => ({
        value: survivor.name,
        label: survivor.name,
        survivor: survivor,
      })),
      // using survivors rather than tribes to get tribes currently in the game
      Tribes: this.survivors.reduce((list, surv) => {
        if (!list.some((opt) => opt.value === surv.tribe)) {
          list.push({
            value: surv.tribe,
            label: surv.tribe,
          });
        }
        return list;
      }, []),
      Episodes: this.episodes
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
  }

  // get values for draft page
  get draftValues() {
    return {
      Survivors: this.survivors.map((survivor) => ({
        value: survivor.name,
        label: survivor.name,
        survivor: survivor,
      })),
      Tribes: this.tribes.map((tribe) => ({
        value: tribe.name,
        label: tribe.name,
      })),
      AvailableSurvivors: this.availableSurvivorsHelper(survivors, players),
      DraftOrder: this.players
        .sort((p1, p2) => p1.draft.order - p2.draft.order)
        .map((player) => ({
          value: player.name,
          label: player.name,
          player: player,
        })),
    };
  }

  // get side bet outcomes
  get sideBets() {
    var firstBoot = [],
      firstJurror = [],
      winner = [],
      mostAdvantages = [],
      mostIndividualImmunities = [],
      firstLoser = [];

    var advCounter = {};
    var indivImmCounter = {};

    this.episodes.forEach((episode) => {
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
        var losers = this.players.filter((player) =>
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
      mostAdvantages,
      mostIndividualImmunities,
      firstLoser,
    };
  }
}

export default GameData;