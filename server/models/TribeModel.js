const mongoose = require("mongoose");

const tribeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

const TribeModel = mongoose.model("tribes", tribeSchema);
module.exports = TribeModel;
