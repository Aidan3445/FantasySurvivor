const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const draftSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
  },
  survivor: {
    type: String,
    default: "",
  },
  firstBoot: {
    type: String,
    default: "",
  },
  winner: {
    type: String,
    default: "",
  },
  firstJurror: {
    type: String,
    default: "",
  },
  mostAdvantages: {
    type: String,
    default: "",
  },
  mostIndividualImmunities: {
    type: String,
    default: "",
  },
  firstLoser: {
    type: String,
    default: "",
  },
});

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    survivorList: {
      type: Array,
      default: [],
    },
    password: {
      type: String,
      required: true,
    },
    rememberMeToken: {
      type: String,
      default: "",
    },
    draft: {
      type: draftSchema,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false }
);

playerSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

playerSchema.methods.validation = function (input, stored) {
  return bcrypt.compareSync(input, stored);
};

const PlayerModel = mongoose.model("players", playerSchema);
module.exports = PlayerModel;
