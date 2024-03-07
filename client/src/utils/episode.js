import { DateTime } from "luxon";
import * as points from "./performancePoints.js";

export default class Episode {
    // construct a new episode
    constructor({ number = 0, title = "", airDate = null } = {}) {
        this.number = number;
        this.title = title;
        this.airDate = airDate;
        this.advsFound = [];
        this.advPlaysSelf = [];
        this.advPlaysOther = [];
        this.badAdvPlays = [];
        this.advsEliminated = [];
        this.spokeEpTitle = [];
        this.tribe1sts = [];
        this.tribe2nds = [];
        this.indivWins = [];
        this.indivRewards = [];
        this.blindsides = [];
        this.finalThree = [];
        this.fireWins = [];
        this.soleSurvivor = [];
        this.eliminated = [];
        this.quits = [];
        this.tribeUpdates = [];
        this.merged = false;
        this.notes = [];
    }

    // map names
    static mapNames(json) {
        return json.map((item) => {
            var jsonObj = item;
            while (jsonObj?.name) {
                jsonObj = jsonObj.name;
            }
            return jsonObj;
        });
    }

    static fromJSON(json) {
        var episode = new Episode();
        episode.number = json.number;
        episode.title = json.title;
        episode.airDate = json.airDate;
        episode.merged = json.merged;

        episode.advsFound = Episode.mapNames(json.advsFound);
        episode.advPlaysSelf = Episode.mapNames(json.advPlaysSelf);
        episode.advPlaysOther = Episode.mapNames(json.advPlaysOther);
        episode.badAdvPlays = Episode.mapNames(json.badAdvPlays);
        episode.advsEliminated = Episode.mapNames(json.advsEliminated);
        episode.spokeEpTitle = Episode.mapNames(json.spokeEpTitle);
        episode.tribe1sts = json.tribe1sts;
        episode.tribe2nds = json.tribe2nds;
        episode.indivWins = Episode.mapNames(json.indivWins);
        episode.indivRewards = Episode.mapNames(json.indivRewards);
        episode.blindsides = Episode.mapNames(json.blindsides);
        episode.finalThree = Episode.mapNames(json.finalThree);
        episode.fireWins = Episode.mapNames(json.fireWins);
        episode.soleSurvivor = Episode.mapNames(json.soleSurvivor);
        episode.eliminated = Episode.mapNames(json.eliminated);
        episode.quits = json.quits;

        episode.tribeUpdates = json.tribeUpdates.map((update) => {
            return {
                tribe: update.tribe.name,
                survivors: Episode.mapNames(update.survivors)
            }
        });
        episode.notes = json.notes.map((note) => {
            return {
                name: note.name?.name || note.name, // needed bc json can be raw or parsed
                notes: note.notes,
                onModel: note.onModel
            }
        });
        episode.consolidateNotes();
        return episode;
    }

    // make shallow copy of the episode
    copy() {
        var epCopy = Episode.fromJSON(JSON.parse(JSON.stringify(this)));
        // not quite sure why this is necessary now but it fixes a bug where
        // the tribe updates are not coppied correctly
        epCopy.tribeUpdates = JSON.parse(JSON.stringify(this.tribeUpdates));
        return epCopy;
    }

    //#region add functions
    // add single note
    addNote(name, note, onModel) {
        if (note.length > 0) this.notes.push({ name: name, notes: [note], onModel: onModel });
        return this;
    }

    // add advantage found
    addAdvFound(survivorName, advName) {
        this.advsFound.push(survivorName);
        this.addNote(survivorName, `Found ${advName}!`, "Survivors");
        return this;
    }

    // add advantage played on self
    addAdvPlaySelf(survivorName, advName) {
        this.advPlaysSelf.push(survivorName);
        this.addNote(survivorName, `Played ${advName} on themselves!`, "Survivors");
        return this;
    }

    // add advantage played for someone else
    addAdvPlayOther(survivorName, advName, played) {
        this.advPlaysOther.push(survivorName);
        this.addNote(survivorName, `Played ${advName} on ${played}!`);
        played.forEach((name) => {
            this.addNote(name, `${survivorName} played ${advName} on them!`, "Survivors");
        });
        return this;
    }

    // add advantage played incorrectly
    addBadAdvPlay(survivorName, advName) {
        this.badAdvPlays.push(survivorName);
        this.addNote(survivorName, `Played ${advName} incorrectly!`, "Survivors");
        return this;
    }

    // add advantage held when eliminated
    addAdvEliminated(survivorName, advName) {
        this.advsEliminated.push(survivorName);
        this.addNote(survivorName, `Eliminated with ${advName}!`, "Survivors");
        return this;
    }

    // add spoke episode title
    setSpokeEpTitle(survivorName) {
        this.spokeEpTitle.push(survivorName);
        this.addNote(survivorName, "Spoke episode title!", "Survivors");
        return this;
    }

    // add tribe that won challenge
    // note that tribe includes team challenges post merge whiere
    // 'name' is a survivor's name, not a tribe name
    addTribe1st(name, onModel, wasReward) {
        this.tribe1sts.push({ name: { name: name }, onModel: onModel });
        this.addNote(
            name,
            `${name} won a challenge! ${wasReward ? "(reward)" : "(immunity)"}`,
            onModel
        );
        return this;
    }

    // add tribe that got second in challenge
    // note that tribe includes team challenges post merge whiere
    // 'name' is a survivor's name, not a tribe name
    addTribe2nd(name, onModel, wasReward) {
        this.tribe2nds.push({ name: { name: name }, onModel: onModel });
        this.addNote(
            name,
            `${name} got seccond in a challenge! ${wasReward ? "(reward)" : "(immunity)"}`,
            onModel
        );
        return this;
    }

    // add individual immunity win
    addIndivWin(survivorName) {
        this.indivWins.push(survivorName);
        this.addNote(survivorName, "Won individual immunity!", "Survivors");
        return this;
    }

    // add individual reward win
    addIndivReward(survivorName) {
        this.indivRewards.push(survivorName);
        this.addNote(survivorName, "Won individual reward!", "Survivors");
        return this;
    }

    // add blindside
    addBlindside(survivorName) {
        this.blindsides.push(survivorName);
        this.addNote(survivorName, "Orchestraded the blindside!", "Survivors");
        return this;
    }

    // add final three
    addFinalThree(survivorName) {
        this.finalThree.push(survivorName);
        this.addNote(survivorName, "Made it to the final three!", "Survivors");
        return this;
    }

    // add fire making challenge win
    addWonFire(survivorName) {
        this.fireWins.push(survivorName);
        this.addNote(survivorName, "Won the fire making challenge!", "Survivors");
        return this;
    }

    // add sole survivorName
    addSoleSurvivor(survivorName) {
        this.soleSurvivor.push(survivorName);
        this.addNote(survivorName, "Won is the Sole Survivor!", "Survivors");
        return this;
    }

    // add eliminated
    addEliminated(survivorName, votesAgainst) {
        this.eliminated.push(survivorName);
        this.addNote(survivorName, "Eliminated!", "Survivors");
        this.addNote(survivorName, `Votes against: ${votesAgainst.join(", ")}`, "Survivors");
        return this;
    }

    // add quit
    addQuit(survivorName) {
        this.quits.push(survivorName);
        this.eliminated.push(survivorName);
        this.addNote(survivorName, "Quit!", "Survivors");
        return this;
    }

    // add tribe update
    addTribeUpdate(survivorName, tribe) {
        this.addNote(survivorName, `Moved to ${tribe}!`);
        var updateIndex = this.tribeUpdates.findIndex(
            (swap) => swap.tribe === tribe
        );
        if (updateIndex !== -1) {
            this.tribeUpdates[updateIndex].survivors.push(survivorName);
        } else {
            this.tribeUpdates.push({ tribe: tribe, survivors: [survivorName] });
        }
        return this;
    }

    // add event from data entry
    addEvent(event, eventEffects, notes, allNameModels, affected, additionalString) {
        eventEffects.forEach((effects) => {
            const { name, onModel } = effects;
            switch (event) {
                case "advsFound":
                    this.addAdvFound(name, additionalString);
                    break;
                case "advPlaysSelf":
                    this.addAdvPlaySelf(name, additionalString);
                    break;
                case "advPlaysOther":
                    this.addAdvPlayOther(name, additionalString, affected);
                    break;
                case "badAdvPlays":
                    this.addBadAdvPlay(name, additionalString);
                    break;
                case "advsEliminated":
                    this.addAdvEliminated(name, additionalString);
                    break;
                case "spokeEpTitle":
                    this.setSpokeEpTitle(name);
                    break;
                case "tribe1sts":
                    this.addTribe1st(name, onModel, additionalString);
                    break;
                case "tribe2nds":
                    this.addTribe2nd(name, onModel, additionalString);
                    break;
                case "indivWins":
                    this.addIndivWin(name);
                    break;
                case "indivRewards":
                    this.addIndivReward(name);
                    break;
                case "blindsides":
                    this.addBlindside(name);
                    break;
                case "finalThree":
                    this.addFinalThree(name);
                    break;
                case "fireWins":
                    this.addWonFire(name);
                    break;
                case "soleSurvivor":
                    this.addSoleSurvivor(name);
                    break;
                case "tribeSwap":
                    this.addTribeUpdate(name, affected[0]);
                    break;
                case "eliminated":
                    this.addEliminated(name, affected);
                    break;
                default:
                    break;
            }
        });

        if (event === "merged") {
            this.merged = true;
            affected.forEach((name) => {
                this.addTribeUpdate(name, additionalString);
            });
            this.addNote(additionalString, `Merged to ${additionalString}!`);
        }

        if (notes) {
            var parsedNotes = this.parseNotes(notes, eventEffects, allNameModels);
            this.notes = this.notes.concat(parsedNotes);
        }
        return this.consolidateNotes();
    }

    //#endregion

    // parse notes from data entry
    parseNotes(notes, eventEffects, allNameModels) {
        var notesArr = notes.split("\n");
        var parsedNotes = [];

        notesArr.forEach((note) => {
            if (note.startsWith("@")) {
                var taggedName = note.split(" ")[0].substring(1);
                var fullNameModel = allNameModels.find((nameModel) =>
                    nameModel.name.startsWith(taggedName));
                if (!fullNameModel) {
                    return;
                }
                var afterTag = note.split(`@${taggedName} `)[1];
                var index = parsedNotes.findIndex((note) => note.name === fullNameModel.name);
                if (index !== -1) {
                    parsedNotes[index].notes.push(afterTag);
                } else {
                    parsedNotes.push({
                        name: fullNameModel.name,
                        notes: [afterTag],
                        onModel: fullNameModel.onModel
                    });
                }
            } else {
                eventEffects.forEach((effect) => {
                    const { name, onModel } = effect;
                    var index = parsedNotes.findIndex((note) => note.name === name);
                    if (index !== -1) {
                        parsedNotes[index].notes.push(note);
                    } else {
                        parsedNotes.push({ name: name, notes: [note], onModel: onModel });
                    }
                });
            }
        });

        return parsedNotes;
    }

    // consolidate notes
    consolidateNotes() {
        var notes = [];
        var names = [];
        this.notes.forEach((note) => {
            if (!names.includes(note.name)) {
                names.push(note.name);
                notes.push(note);
            } else {
                var index = names.indexOf(note.name);
                notes[index].notes = notes[index].notes.concat(note.notes);
            }
        });
        this.notes = notes;
        return this;
    }

    // calculate points for one name array
    calculatePoints(array, value, pointTotals, names, divide = false) {
        array.forEach((name) => {
            if (!names.includes(name)) {
                names.push(name);
                pointTotals.push({ name: name, points: value });
            } else {
                var index = names.indexOf(name);
                pointTotals[index].points += divide ? value / array.length : value;
            }
        });

        return [pointTotals, names];
    }

    // calculate points for all players
    get points() {
        var pointTotals = [];
        var names = [];

        [pointTotals, names] = this.calculatePoints(
            this.advsFound,
            points.advFoundMultiplier,
            pointTotals,
            names
        );

        [pointTotals, names] = this.calculatePoints(
            this.advPlaysSelf,
            points.advPlaySelfMultiplier,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.advPlaysOther,
            points.advPlayOtherMultiplier,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.badAdvPlays,
            points.badAdvPlayMultiplier,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.advsEliminated,
            points.advEliminatedMultiplier,
            pointTotals,
            names
        );

        [pointTotals, names] = this.calculatePoints(
            this.tribe1sts.map((entry) => entry.name.name),
            points.tribe1stMultiplier,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.tribe2nds.map((entry) => entry.name.name),
            points.tribe2ndMultiplier,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.indivWins,
            points.indivWinMultiplier,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.indivRewards,
            points.indivRewardMultiplier,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.spokeEpTitle,
            points.episodeTitleValue,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.blindsides,
            points.blindsideMultiplier,
            pointTotals,
            names,
            true // blindside points are split between all blindsiders
        );
        [pointTotals, names] = this.calculatePoints(
            this.finalThree,
            points.finalThreeValue,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.fireWins,
            points.wonFireValue,
            pointTotals,
            names
        );
        [pointTotals, names] = this.calculatePoints(
            this.soleSurvivor,
            points.soleSurvivorValue,
            pointTotals,
            names
        );
        return pointTotals;
    }

    // get points for a single name
    getPoints(survivor) {
        var { name, tribe } = survivor;
        tribe = survivor.stats ? this.getTribeHelper(survivor.stats) : tribe;

        var pointTotals = this.points;

        var nameIndex = pointTotals.findIndex((point) => point.name === name);
        var tribeIndex = pointTotals.findIndex((point) => point.name === tribe);

        var namePoints = nameIndex === -1 ? 0 : pointTotals[nameIndex].points;
        var tribePoints = tribeIndex === -1 ? 0 : pointTotals[tribeIndex].points;

        return namePoints + tribePoints;
    }

    // has the episode aired
    get aired() {
        var episodeStart = DateTime.fromISO(this.airDate)
            .set({ hour: 20 })
            .setZone("America/New_York");
        var episodeEnd = episodeStart.plus({ hours: 1, minutes: 30 });
        var now = DateTime.now().setZone("America/New_York");

        if (now < episodeStart) return -1;
        if (now > episodeEnd) return 1;
        return 0;
    }

    get lastEp() {
        return this.soleSurvivor.length > 0;
    }

    // component helpers
    getTableValues(survivor) {
        var { name, stats } = survivor;
        var tribe = this.getTribeHelper(stats);
        return [
            this.advsFound.filter((entry) => entry === name).length,
            this.advPlaysSelf.filter((entry) => entry === name).length,
            this.advPlaysOther.filter((entry) => entry === name).length,
            this.badAdvPlays.filter((entry) => entry === name).length,
            this.advsEliminated.filter((entry) => entry === name).length,
            this.tribe1sts.filter((entry) =>
                entry.name.name === tribe || entry.name.name === name).length,
            this.tribe2nds.filter((entry) =>
                entry.name.name === tribe || entry.name.name === name).length,
            this.indivWins.filter((entry) => entry === name).length,
            this.indivRewards.filter((entry) => entry === name).length,
            this.spokeEpTitle.includes(name) ? "Yes" : "No",
            this.blindsides.includes(name) ? "Yes" : "No",
            this.finalThree.includes(name) ? "Yes" : "No",
            this.fireWins.includes(name) ? "Yes" : "No",
            this.soleSurvivor.includes(name) ? "Yes" : "No",
        ];
    }

    getNotes(survivor) {
        var { name, stats } = survivor;
        var tribe = this.getTribeHelper(stats);
        var notes = [];
        this.notes.forEach((note) => {
            if (note.name === name || note.name === tribe) {
                notes = notes.concat(note.notes);
            }
        });

        return notes;
    }

    getTribeHelper(stats) {
        if (!stats) return "";
        return stats.tribeList.findLast((update) => update.episode < this.number)
            .tribe;
    }
}
