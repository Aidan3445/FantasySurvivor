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
    tribe: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

const SurvivorModel = mongoose.model("survivors", survivorSchema);
module.exports = SurvivorModel;
