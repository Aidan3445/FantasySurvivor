const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const env = require("dotenv");

env.config();
const app = express();
const server = app.listen(process.env.PORT || 1332, async () => {
    console.log("Server running on port 1332!");
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
});

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    socket.on("update", (data) => {
        socket.broadcast.emit("update", data);
    });
});

app.use(cors());
app.use(express.json());

const Player = require("./models/PlayerModel");
const Season = require("./models/SeasonModel");
const Episode = require("./models/EpisodeModel");
const Survivor = require("./models/SurvivorModel");
const Tribe = require("./models/TribeModel");
const PlayersSeason = require("./models/PlayersSeasonModel");

//#region season helpers
// get seasonID from seasonName
const findSeason = async (seasonName) => {
    try {
        const seasonID = await Season.findOne({ seasonName: seasonName });

        if (!seasonID) {
            // return error if season not found
            throw new Error(`Season ${seasonName} not found`);
        }

        return seasonID._id;
    } catch (err) {
        // pass error to caller
        throw err;
    }
}
//#endregion

//#region episode routes
app.get("/api/:seasonName/episodes", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        // get all episodes from the season sorted by number
        const episodes = await Episode.find({ season: season }).sort({ number: 1 });
        res.json(episodes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/:seasonName/episode/:number", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        // get the episode from the season
        const episode = await Episode.findOne({ season: season, number: req.params.number });

        if (!episode) {
            // return error if episode not found
            res.status(400).json({ error: `Episode ${req.params.number} not found in season ${req.params.seasonName}` });
            return;
        }

        res.json(episode);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/episode/new", async (req, res) => {
    try {
        const { seasonName, number } = req.body;
        // get the seasonID
        const season = await findSeason(req.body.season);
        // get the previous episode
        const prevEpisode = await Episode.findOne({ season: season, number: number - 1 });

        if (!prevEpisode && number !== 1) {
            // return error if previous episode does not exist
            // first episode does not need a previous episode
            res.status(400).json({
                error:
                    `Previous episode ${number - 1} not found in season ${seasonName}`
            });
            return;
        }

        // check if episode already exists
        const checkEpisode = await Episode.findOne({ season: season, number: number });

        if (checkEpisode) {
            // return error if episode already exists
            res.status(400).json({
                error:
                    `Episode ${number} already exists in season ${seasonName}`
            });
            return;
        }

        // create new episode
        const newEpisode = new Episode(req.body);
        // save new episode
        await newEpisode.save();
        res.json(newEpisode);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/episode/update", async (req, res) => {
    try {
        const updatedEpisode = req.body;
        const { seasonName, number } = updatedEpisode;
        // get the seasonID
        const season = await findSeason(seasonName);
        // update the episode
        const episode = await Episode.findOneAndUpdate(
            { season: season, number: number },
            updatedEpisode,
            { new: true }
        );

        if (!episode) {
            // return error if episode not found
            res.status(400).json({ error: `Episode ${number} not found in season ${seasonName}` });
            return;
        }

        // return updated episode
        res.json(episode);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
//#endregion

//#region playersSeason routes
app.get("/api/:seasonName/players", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        // get all players from the season
        const players = await PlayersSeason.find({ season: season });

        if (!players) {
            // return error if players not found
            res.status(400).json({ error: `No players found in season ${req.params.seasonName}` });
            return;
        }

        res.json(players);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/:seasonName/player/:name", async (req, res) => {
    try {
        const { seasonName, name } = req.params;
        // get the seasonID
        const season = await findSeason(seasonName);
        // get the player from the season
        const player = await PlayersSeason.find({ season: season, name: name });

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found in season ${seasonName}` });
            return;
        }

        res.json(player);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/:seasonName/player/:name/draft", async (req, res) => {
    try {
        const { seasonName, name } = req.params;
        // get the seasonID
        const season = await findSeason(seasonName);
        const draft = req.body;
        // get the player from the season
        const player = await PlayersSeason.findOne({ season: season, name: name })
        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found in season ${seasonName}` });
        }
        // remap draft names to survivor IDs
        const draftPromises = Object.keys(draft).map(async (key) => {
            const survivor = await Survivor.findOne({ name: draft[key] });
            if (survivor) {
                draft[key] = survivor._id;
            }
        });
        await Promise.all(draftPromises);

        player.draft = draft;
        player.survivors = draft.survivor ? [draft.survivor] : [];

        const updatedPlayer = await player.save();
        res.json(updatedPlayer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/:seasonName/player/:playerName/changesurvivor/:survivorName", async (req, res) => {
    try {
        const { seasonName, playerName, survivorName } = req.params;
        // get the seasonID
        const season = await findSeason(seasonName);
        // get the player from the season
        const player = await PlayersSeason.findOne({ season: season, name: playerName });

        if (!player) {
            // return error if player not found
            res.status(400).json({
                error: `Player ${playerName} not found ` +
                    `in season ${seasonName}`
            });
            return;
        }

        // find the survivor by name
        const survivor = await Survivor.findOne({ season: season, name: survivorName });

        if (!survivor) {
            // return error if survivor not found
            res.status(400).json({
                error: `Survivor ${survivorName} ` +
                    `not found in season ${seasonName}`
            });
            return;
        }

        // update the player's survivor list
        player.survivorList[player.survivorList.length - 1] = survivor._id;
        const updatedPlayer = await player.save();
        res.json(updatedPlayer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
//#endregion

//#region player routes
// TODO: use passport.js for authentication
app.get("/api/player/login/", async (req, res) => {
    try {
        const { name, password } = req.body;
        // find player by name
        const player = await Player.findOne({ name: name });

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found` });
            return;
        }

        if (player.validation(password, player.password)) {
            res.json(player);
            return;
        }
        res.status(400).json({ error: "Player Name and Password combination not found." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/player/:name/rememberMe/:token", async (req, res) => {
    try {
        var { name, token } = req.params;
        const player = await Player.findOne({ name: name });

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found` });
            return;
        }

        if (player.validation(token, player.rememberMeToken)) {
            res.json(player);
            return;
        }
        res.status(400).json({ error: "Login information not found." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/player/:name/rememberMe", async (req, res) => {
    try {
        const { name } = req.params;
        const { token } = req.body;
        const player = await Player.findOne({ name: name });

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found` });
            return;
        }

        player.rememberMeToken = player.generateHash(token);
        const updatedPlayer = player.save();
        res.json(updatedPlayer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/player/:name/changePassword", async (req, res) => {
    try {
        const { newPassword, oldPassword } = req.body;
        const { name } = req.params;
        const player = await Player.findOne({ name: name })

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found` });
            return;
        }

        if (player.validation(oldPassword, player.password)) {
            // if old password is correct, update password
            player.password = player.generateHash(newPassword);
            // save updated player
            player.save();
            res.json(player);
            return;
        }
        res.json({
            error: `Previous password incorrect. Contact Aidan if you need help.`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/player/:name/changeColor", async (req, res) => {
    try {
        const { newColor } = req.body;
        const { name } = req.params;
        const player = await Player.findOne({ name: name });

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found` });
            return;
        }
        
        // update player color and save
        player.color = newColor;
        player.save();
        res.json(player);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
//#endregion

//#region survivor routes
app.get("/api/:seasonName/survivors", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        const survivors = await Survivor.find({ season: season });

        if (!survivors) {
            // return error if survivors not found
            res.status(400).json({ error: `No survivors found in season ${req.params.seasonName}` });
            return;
        }

        res.json(survivors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/survivor/:name", async (req, res) => {
    Survivor.find({ name: req.params.name })
        .then((survivors) => res.json(survivors))
        .catch((err) => res.json(err));
});
//#endregion

// tribe routes
app.get("/api/:seasonName/tribes", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        const tribes = await Tribe.find({ season: season });

        if (!tribes) {
            // return error if tribes not found
            res.status(400).json({ error: `No tribes found in season ${req.params.seasonName}` });
            return;
        }

        res.json(tribes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/:seasonName/tribe/:name", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        const tribe = await Tribe.find({ season: season, name: req.params.name });

        if (!tribe) {
            // return error if tribe not found
            res.status(400).json({ error: `Tribe ${req.params.name} not found in season ${req.params.seasonName}` });
            return;
        }

        res.json(tribe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/:seasonName/tribe/new", async (req, res) => {
    try {
        const { seasonName } = req.params;
        const { tribeName, tribeColor } = req.body;
        // get the seasonID
        const season = await findSeason(seasonName);

        // check if tribe already exists
        const checkTribe = await Tribe.findOne({ name: tribeName, season: season });
        if (checkTribe) {
            // return error if tribe already exists
            res.status(400).json({ error: `Tribe ${tribeName} already exists in season ${seasonName}` });
            return;
        }

        // create new tribe
        const newTribe = new Tribe({ name: tribeName, color: tribeColor, season: season });
        // save new tribe
        await newTribe.save();
        res.json(newTribe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

//#endregion
