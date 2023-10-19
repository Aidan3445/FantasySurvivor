const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  notes: {
    type: Array,
    require: true,
  },
});

const tribeUpdateSchema = new mongoose.Schema({
  tribe: {
    type: String,
    required: true,
  },
  survivors: {
    type: Array,
    required: true,
  },
});

const episodeSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    airDate: {
      type: String,
      required: true,
    },
    advsFound: {
      type: Array,
      default: [],
    },
    advPlaysSelf: {
      type: Array,
      default: [],
    },
    advPlaysOther: {
      type: Array,
      default: [],
    },
    badAdvPlays: {
      type: Array,
      default: [],
    },
    advsEliminated: {
      type: Array,
      default: [],
    },
    spokeEpTitle: {
      type: Array,
      default: [],
    },
    tribe1sts: {
      type: Array,
      default: [],
    },
    tribe2nds: {
      type: Array,
      default: [],
    },
    indivWins: {
      type: Array,
      default: [],
    },
    indivRewards: {
      type: Array,
      default: [],
    },
    blindsides: {
      type: Array,
      default: [],
    },
    finalThree: {
      type: Array,
      default: [],
    },
    fireWins: {
      type: Array,
      default: [],
    },
    soleSurvivor: {
      type: Array,
      default: [],
    },
    eliminated: {
      type: Array,
      default: [],
    },
    merged: {
      type: Boolean,
      default: false,
    },
    tribeUpdates: {
      type: [tribeUpdateSchema],
      default: [],
    },
    notes: {
      type: [notesSchema],
      default: [],
    },
  },
  { versionKey: false }
);

const EpisodeModel = mongoose.model("episodes", episodeSchema);
module.exports = EpisodeModel;
