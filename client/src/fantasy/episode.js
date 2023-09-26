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
    this.merged = false;
    this.notes = [];
  }

  static fromJSON(json) {
    var episode = new Episode();
    episode.number = json.number;
    episode.title = json.title;
    episode.airDate = DateTime.fromISO(json.airDate)
      .set({ hour: 21, minute: 30 })
      .setZone("America/New_York");
    episode.advsFound = json.advsFound;
    episode.advPlaysSelf = json.advPlaysSelf;
    episode.advPlaysOther = json.advPlaysOther;
    episode.badAdvPlays = json.badAdvPlays;
    episode.advsEliminated = json.advsEliminated;
    episode.spokeEpTitle = json.spokeEpTitle;
    episode.tribe1sts = json.tribe1sts;
    episode.tribe2nds = json.tribe2nds;
    episode.indivWins = json.indivWins;
    episode.indivRewards = json.indivRewards;
    episode.blindsides = json.blindsides;
    episode.finalThree = json.finalThree;
    episode.fireWins = json.fireWins;
    episode.soleSurvivor = json.soleSurvivor;
    episode.eliminated = json.eliminated;
    episode.quits = json.quits;
    episode.notes = json.notes;
    episode.merged = json.merged;
    episode.consolidateNotes();
    return episode;
  }

  // make shallow copy of the episode
  copy() {
    return Episode.fromJSON(JSON.parse(JSON.stringify(this)));
  }

  //#region add functions
  // add single note
  addNote(name, note) {
    if (note.length > 0) this.notes.push({ name: name, notes: [note] });
    return this;
  }

  // add advantage found
  addAdvFound(survivorName, advName) {
    this.advsFound.push(survivorName);
    this.addNote(survivorName, `Found ${advName}!`);
    return this;
  }

  // add advantage played on self
  addAdvPlaySelf(survivorName, advName) {
    this.advPlaysSelf.push(survivorName);
    this.addNote(survivorName, `Played ${advName} on themselves!`);
    return this;
  }

  // add advantage played for someone else
  addAdvPlayOther(survivorName, advName, played) {
    this.advPlaysOther.push(survivorName);
    this.addNote(survivorName, `Played ${advName} on ${played}!`);
    played.forEach((name) => {
      this.addNote(name, `${survivorName} played ${advName} on them!`);
    });
    return this;
  }

  // add advantage played incorrectly
  addBadAdvPlay(survivorName, advName) {
    this.badAdvPlays.push(survivorName);
    this.addNote(survivorName, `Played ${advName} incorrectly!`);
    return this;
  }

  // add advantage held when eliminated
  addAdvEliminated(survivorName, advName) {
    this.advsEliminated.push(survivorName);
    this.addNote(survivorName, `Eliminated with ${advName}!`);
    return this;
  }

  // add spoke episode title
  setSpokeEpTitle(survivorName) {
    this.spokeEpTitle.push(survivorName);
    this.addNote(survivorName, "Spoke episode title!");
    return this;
  }

  // add tribe that won challenge
  addTribe1st(tribe, wasReward) {
    this.tribe1sts.push(tribe);
    this.addNote(
      tribe,
      `${tribe} won a challenge! ${wasReward ? "(reward)" : "(immunity)"}`
    );
    return this;
  }

  // add tribe that got second in challenge
  addTribe2nd(tribe, wasReward) {
    this.tribe2nds.push(tribe);
    this.addNote(
      tribe,
      `${tribe} got seccond in a challenge! ${
        wasReward ? "(reward)" : "(immunity)"
      }`
    );
    return this;
  }

  // add individual immunity win
  addIndivWin(survivorName) {
    this.indivWins.push(survivorName);
    this.addNote(survivorName, "Won individual immunity!");
    return this;
  }

  // add individual reward win
  addIndivReward(survivorName) {
    this.indivRewards.push(survivorName);
    this.addNote(survivorName, "Won individual reward!");
    return this;
  }

  // add blindside
  addBlindside(survivorName) {
    this.blindsides.push(survivorName);
    this.addNote(survivorName, "Orchestraded the blindside!");
    return this;
  }

  // add final three
  addFinalThree(survivorName) {
    this.finalThree.push(survivorName);
    this.addNote(survivorName, "Made it to the final three!");
    return this;
  }

  // add fire making challenge win
  addWonFire(survivorName) {
    this.fireWins.push(survivorName);
    this.addNote(survivorName, "Won the fire making challenge!");
    return this;
  }

  // add sole survivorName
  addSoleSurvivor(survivorName) {
    this.soleSurvivor.push(survivorName);
    this.addNote(survivorName, "Won is the Sole Survivor!");
    return this;
  }

  // add eliminated
  addEliminated(survivorName, votesAgainst) {
    this.eliminated.push(survivorName);
    this.addNote(survivorName, "Eliminated!");
    this.addNote(survivorName, `Votes against: ${votesAgainst.join(", ")}`);
    return this;
  }

  // add quit
  addQuit(survivorName) {
    this.quits.push(survivorName);
    this.eliminated.push(survivorName);
    this.addNote(survivorName, "Quit!");
    return this;
  }

  // add event from data entry
  addEvent(
    event,
    eventNames,
    notes,
    allNames,
    additionalString,
    additionalSurvivors
  ) {
    eventNames.forEach((name) => {
      switch (event) {
        case "advsFound":
          this.addAdvFound(name, additionalString);
          break;
        case "advPlaysSelf":
          this.addAdvPlaySelf(name, additionalString);
          break;
        case "advPlaysOther":
          this.addAdvPlayOther(name, additionalString, additionalSurvivors);
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
          this.addTribe1st(name, additionalString);
          break;
        case "tribe2nds":
          this.addTribe2nd(name, additionalString);
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
        case "eliminated":
          this.addEliminated(name, additionalSurvivors);
          break;
        default:
          break;
      }
    });

    if (event === "merged") this.merged = true;

    if (notes) {
      var parsedNotes = this.parseNotes(notes, eventNames, allNames);
      this.notes = this.notes.concat(parsedNotes);
    }
    return this.consolidateNotes();
  }

  //#endregion

  // parse notes from data entry
  parseNotes(notes, eventNames, allNames) {
    var notesArr = notes.split("\n");
    var parsedNotes = [];

    notesArr.forEach((note) => {
      if (note.startsWith("@")) {
        var taggedName = note.split(" ")[0].substring(1);
        var fullName = allNames.find((name) => name.startsWith(taggedName));
        if (!fullName) {
          console.log(`No player found with name ${taggedName}`);
          return;
        }
        var afterTag = note.split(`@${taggedName} `)[1];
        var index = parsedNotes.findIndex((note) => note.name === fullName);
        if (index !== -1) {
          parsedNotes[index].notes.push(afterTag);
        } else {
          parsedNotes.push({ name: fullName, notes: [afterTag] });
        }
      } else {
        eventNames.forEach((name) => {
          var index = parsedNotes.findIndex((note) => note.name === name);
          if (index !== -1) {
            parsedNotes[index].notes.push(note);
          } else {
            parsedNotes.push({ name: name, notes: [note] });
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
      this.tribe1sts,
      points.tribe1stMultiplier,
      pointTotals,
      names
    );
    [pointTotals, names] = this.calculatePoints(
      this.tribe2nds,
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
    var pointTotals = this.points;

    var nameIndex = pointTotals.findIndex((point) => point.name === name);
    var tribeIndex = pointTotals.findIndex((point) => point.name === tribe);

    var namePoints = nameIndex === -1 ? 0 : pointTotals[nameIndex].points;
    var tribePoints = tribeIndex === -1 ? 0 : pointTotals[tribeIndex].points;

    return namePoints + tribePoints;
  }

  // has the episode aired
  get aired() {
    // console.log([this.airDate, new Date(), this.airDate < new Date()]);
    return this.airDate < DateTime.now();
  }

  // component helpers
  getTableValues(survivor) {
    var { name, tribe } = survivor;

    return [
      this.advsFound.filter((val) => val === name).length,
      this.advPlaysSelf.filter((val) => val === name).length,
      this.advPlaysOther.filter((val) => val === name).length,
      this.badAdvPlays.filter((val) => val === name).length,
      this.advsEliminated.filter((val) => val === name).length,
      this.tribe1sts.filter((val) => val === tribe || val === name).length,
      this.tribe2nds.filter((val) => val === tribe || val === name).length,
      this.indivWins.filter((val) => val === name).length,
      this.indivRewards.filter((val) => val === name).length,
      this.spokeEpTitle.includes(name) ? "Yes" : "No",
      this.blindsides.includes(name) ? "Yes" : "No",
      this.finalThree.includes(name) ? "Yes" : "No",
      this.fireWins.includes(name) ? "Yes" : "No",
      this.soleSurvivor.includes(name) ? "Yes" : "No",
    ];
  }

  getNotes(survivor) {
    var { name, tribe } = survivor;
    var notes = [];
    this.notes.forEach((note) => {
      if (note.name === name || note.name === tribe) {
        notes = notes.concat(note.notes);
      }
    });

    return notes;
  }
}
