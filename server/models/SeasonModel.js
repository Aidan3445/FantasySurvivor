const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
},
    { versionKey: false }
);

const SeasonModel = mongoose.model('Seasons', seasonSchema);
module.exports = SeasonModel;
