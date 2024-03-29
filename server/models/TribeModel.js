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
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seasons',
        required: true
    }
  },
  { versionKey: false }
);

const TribeModel = mongoose.model("Tribes", tribeSchema);
module.exports = TribeModel;
