const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        rememberMeToken: {
            type: String,
            default: "",
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    { versionKey: false }
);

playerSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

playerSchema.methods.validation = function(input, stored) {
    return bcrypt.compareSync(input, stored);
};

const PlayerModel = mongoose.model("Players", playerSchema);
module.exports = PlayerModel;
