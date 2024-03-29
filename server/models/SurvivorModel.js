const mongoose = require("mongoose");

const survivorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    hometown: {
      type: String,
      required: true,
    },
    residence: {
      type: String,
      required: true,
    },
    job: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    interview: {
      type: String,
      required: true,
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seasons",
      required: true,
    },
  },
  { versionKey: false }
);

const SurvivorModel = mongoose.model("Survivors", survivorSchema);
module.exports = SurvivorModel;
