import Episode from "./episode";
import { sideBetHitValue } from "./performancePoints";
import { getRunningPoints, sideBetOutcomes } from "./miscUtils";

class GameData {
    constructor(requestData) {
        this.data = requestData;
        this.processed = {
            episodes: false,
            survivors: false,
            players: false,
        };
    }

    // process episode data
    get episodes() {
        if (!this.processed.episodes) {
            var nextEp = 1;
            this.data.episodes = this.data.episodes
                .map((episode) => {
                    var ep = Episode.fromJSON(episode);
                    if (ep.aired >= 0) nextEp = ep.number + 1;
                    return ep;
                }).slice(0, nextEp);
            this.processed.episodes = true;
        }
        return this.data.episodes;
    }

    get lastAired() {
        if (!this.data.lastAired) {
            this.data.lastAired = this.episodes.findLastIndex(
                (episode) => episode.aired > -1
            );
        }
        return this.data.lastAired;
    }

    // process survivor data
    get survivors() {
        if (!this.processed.survivors) {
            this.data.survivors = this.data.survivors
                .map((survivor) => {
                    survivor.stats = this.survivorStats(survivor);
                    survivor.color = this.tribes.find(
                        (tribe) => tribe.name === survivor.tribe
                    )?.color;
                    return survivor;
                })
                .memberSort();
            this.processed.survivors = true;
        }
        return this.data.survivors;
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
            eliminated: null,
            episodeTotals: [],
            tribeList: [],
        };

        var airedCount = 0;

        this.episodes.forEach((episode) => {
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
                (entry) => entry.name === name || entry.name === tribe
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
        return stats;
    }

    // process player data
    get players() {
        if (!this.processed.players) {
            // survivors must be processed before players
            if (!this.processed.survivors) this.survivors;
            this.data.players = this.data.players.map((player) => {
                player.name = player?.player?.name;
                player.draft = this.getDraft(player);
                player.survivors = this.getSurvivorList(player);
                player.stats = this.playerStats(player);
                return player;
            });
            this.processed.players = true;

            this.betOutcomes();
            this.data.players.memberSort();
        }
        return this.data.players;
    }

    playerByName(name) {
        return this.players.find((player) => player.name === name);
    }

    getSurvivorList(player) {
        var survivorList = [];
        for (var i = 0; i < player.survivors.length; i++) {
            const survivor = player.survivors[i];
            if (player.survivors[i + 1]) {
                // add survivor to list until next update
                for (var j = survivor?.episode; j < player.survivors[i + 1]?.episode; j++) {
                    survivorList.push(this.survivorByName(survivor?.survivor?.name));
                }
            } else if (this.lastAired === -1) {
                // add survivor first to list
                survivorList.push(this.survivorByName(survivor?.survivor?.name));
            } else if (this.survivorByName(survivor?.survivor?.name)?.stats.eliminated) {
                // add survivor to list until eliminated episode
                for (var j = survivor?.episode;
                    j <= this.survivorByName(survivor?.survivor?.name)?.stats.eliminated;
                    j++) {
                    survivorList.push(this.survivorByName(survivor?.survivor?.name));
                }
            } else {
                // add survivor to list until last episode
                for (var j = survivor?.episode; j <= this.episodes.length; j++) {
                    survivorList.push(this.survivorByName(survivor?.survivor?.name));
                }
            }
        }
        return survivorList;
    }

    getDraft(player) {
        var draft = {};
        Object.keys(player.draft).forEach((key) => {
            if (player.draft[key]?.name) {
                draft[key] = player.draft[key].name;
            } else {
                draft[key] = player.draft[key];
            }
        });
        return draft;
    }

    playerStats(player) {
        var survivors = player.survivors;
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
        for (var i = 0; i <= this.lastAired; i++) {
            var survivor = survivors[i];
            if (!survivor || (survivor?.stats.eliminated && survivor.stats.eliminated < i + 1)) {
                if (i === this.lastAired && !survivor?.stats.eliminated) {
                    stats.needsSurvivor = true;
                }
                continue;
            }

            var episode = this.episodes[i];
            var performancePoints = episode.getPoints(survivor);
            stats.performancePoints += performancePoints;
            stats.performanceByEp.push(performancePoints);

            if (episode.eliminated.includes(survivor.name) || episode.aired < 1) {
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

        stats.ppe = stats.points / stats.airedCount || 0;

        return stats;
    }

    // add bet outcomes to player stats
    // add to score if final episode has aired
    betOutcomes() {
        this.data.players = this.players.map((player) => {
            player.stats.betHits = 0;
            var bets = this.sideBets;
            Object.keys(bets).forEach((bet) => {
                if (bets[bet].length === 0) return;
                bets[bet].forEach((hits) => {
                    if (hits.names?.includes(player.draft[bet])) {
                        if (
                            this.lastAired === this.episodes.length - 1 &&
                            this.episodes[this.lastAired].lastEp
                        ) {
                            player.stats.points += sideBetHitValue;
                            player.stats.episodeTotals[
                                player.stats.episodeTotals.length - 1
                            ] += sideBetHitValue;
                        }
                        player.stats.betHits++;
                    }
                });
            });

            return player;
        });
    }

    // get tribe by name
    get tribes() {
        return this.data.tribes;
    }

    // get the available survivors
    get availableSurvivors() {
        var availableSurvivors = this.survivors.filter((survivor) => {
            return (
                !survivor.stats.eliminated &&
                !this.players.some((player) => {
                    var currentSurvivor =
                        player.survivors[player.survivors.length - 1];
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
                onModel: "Survivors",
            })),
            // using survivors rather than tribes to get tribes currently in the game
            Tribes: this.survivors.reduce((list, surv) => {
                if (!list.some((opt) => opt.value === surv.tribe)) {
                    list.push({
                        value: surv.tribe,
                        label: surv.tribe,
                        onModel: "Tribes",
                    });
                }
                return list;
            }, []),
            Episodes: this.episodes
                .map((episode) => ({
                    value: episode.number,
                    label: `${episode.number}: ${episode.title} 
                    (${episode.aired === 1
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
            })),
            AvailableSurvivors: this.availableSurvivors,
            DraftOrder: this.players
                .sort((p1, p2) => p1.draft.order - p2.draft.order)
                .map((player) => ({
                    value: player.name,
                    label: player.name,
                })),
        };
    }

    // get side bet outcomes
    get sideBets() {
        if (!this.data.sideBets) {
            this.data.sideBets = sideBetOutcomes(this.players, this.episodes);
        }
        return this.data.sideBets;
    }
}

export default GameData;
