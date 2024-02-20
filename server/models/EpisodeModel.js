const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "notes.onModel",
        required: true,
    },
    notes: {
        type: [String],
        require: true,
    },
    onModel: {
        type: String,
        required: true,
        enum: ["Survivors", "Tribes"],
    },
},
    { versionKey: false, _id: false },
);

const tribeUpdateSchema = new mongoose.Schema({
    tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tribes",
        required: true,
    },
    survivors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Survivors",
    }]
},
    { versionKey: false, _id: false },
);

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
        advsFound: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        advPlaysSelf: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        advPlaysOther: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        badAdvPlays: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],

        advsEliminated: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        spokeEpTitle: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        tribe1sts: [{
            name: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "tribe1sts.onModel",
                required: true,
            },
            onModel: {
                type: String,
                required: true,
                enum: ["Survivors", "Tribes"],
            },
        }],
        tribe2nds: [{
            name: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "tribe2nds.onModel",
                required: true,
            },
            onModel: {
                type: String,
                required: true,
                enum: ["Survivors", "Tribes"],
            },
        }], indivWins: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        indivRewards: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        blindsides: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        finalThree: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        fireWins: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        soleSurvivor: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        eliminated: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        quits: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survivors",
        }],
        merged: {
            type: Boolean,
            default: false,
        },
        tribeUpdates: [{
            type: tribeUpdateSchema,
        }],
        notes: [{
            type: notesSchema,
        }],
        season: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seasons",
            required: true,
        },
    },
    { versionKey: false }
);

const EpisodeModel = mongoose.model("Episodes", episodeSchema);
module.exports = EpisodeModel;
