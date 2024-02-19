const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true,
    },
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survivors',
        default: null,
    },
    firstBoot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survivors',
        default: null,
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survivors',
        default: null,
    },
    firstJurror: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survivors',
        default: null,
    },
    mostAdvantages: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survivors',
        default: null,
    },
    mostIndividualImmunities: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survivors',
        default: null,
    },
    firstLoser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players',
        default: null,
    },
},
    { versionKey: false, _id: false }
);

const survivorUpdateSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survivors',
        required: true
    },
    episode: {
        type: Number,
        required: true
    },
},
    { versionKey: false, _id: false }
);

const playersSeasonSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players',
        required: true
    },
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seasons',
        required: true
    },
    survivors: {
        type: [survivorUpdateSchema],
        default: [],
    },
    draft: {
        type: draftSchema,
        default: () => ({}),
    },
},
    { versionKey: false }
);

const PlayersSeasonModel = mongoose.model('PlayersSeasons', playersSeasonSchema);
module.exports = PlayersSeasonModel;
