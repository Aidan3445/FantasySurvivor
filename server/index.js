const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const env = require("dotenv");

env.config();
const app = express();
const server = app.listen(process.env.PORT || 1332, async () => {
    console.log(`Server running on port ${process.env.PORT || 1332}!`);
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

//#region helpers
// get seasonID from seasonName
const findSeason = async (seasonName) => {
    try {
        const name = decodeURIComponent(seasonName);
        const seasonID = await Season.findOne({ name: name });

        if (!seasonID) {
            // return error if season not found
            throw new Error(`Season ${name} not found`);
        }

        return seasonID;
    } catch (err) {
        // pass error to caller
        throw err;
    }
}
// query and populate episode across all updates
const queryEpisode = async (query) => {
    try {
        return await Episode.find(query)
            .select("-_id -season")
            .populate("advsFound", "name -_id")
            .populate("advPlaysSelf", "name -_id")
            .populate("advPlaysOther", "name -_id")
            .populate("badAdvPlays", "name -_id")
            .populate("advsEliminated", "name -_id")
            .populate("spokeEpTitle", "name -_id")
            .populate("tribe1sts.name", "name -_id")
            .select("-tribe1sts._id")
            .populate("tribe2nds.name", "name -_id")
            .select("-tribe2nds._id")
            .populate("indivWins", "name -_id")
            .populate("indivRewards", "name -_id")
            .populate("blindsides", "name -_id")
            .populate("finalThree", "name -_id")
            .populate("fireWins", "name -_id")
            .populate("soleSurvivor", "name -_id")
            .populate("eliminated", "name -_id")
            .populate({
                path: "tribeUpdates", populate: [
                    { path: "tribe", select: "name -_id" },
                    { path: "survivors", select: "name -_id" }]
            })
            .populate("notes.name", "name -_id")
            .exec();
    } catch (err) {
        throw err;
    }
}
// query and populate playerSeason across all data
const queryPlayersSeason = async (query) => {
    try {
        return await PlayersSeason.find(query)
            .select("-_id -season")
            .populate("player", "name -_id")
            .populate("survivors.survivor", "name -_id")
            .populate({
                path: "draft", populate: [
                    { path: "survivor", select: "name -_id" },
                    { path: "firstBoot", select: "name -_id" },
                    { path: "winner", select: "name -_id" },
                    { path: "firstJurror", select: "name -_id" },
                    { path: "mostAdvantages", select: "name -_id" },
                    { path: "mostIndividualImmunities", select: "name -_id" },
                    { path: "firstLoser", select: "name -_id" }]
            }).exec();
    } catch (err) {
        throw err;
    }
}
//#endregion
//#region season routes
app.get("/api/seasons", async (_req, res) => {
    try {
        const seasons = await Season.find({}).select("-_id").exec();
        if (seasons.length === 0) {
            // return error if seasons not found
            res.status(400).json({ error: "No seasons found" });
            return;
        }

        res.json(seasons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
//#endregion
//#region episode routes
app.get("/api/:seasonName/episodes", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        // get all episodes from the season sorted by number
        const episodes = await queryEpisode({ season: season._id._id });
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
        let episode = await queryEpisode({ season: season._id._id, number: req.params.number });

        if (!episode) {
            // return error if episode not found
            res.status(400).json(
                { error: `Episode ${req.params.number} not found in season ${season.name}` }
            );
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
        const season = await findSeason(seasonName);
        // get the previous episode
        const prevEpisode = await queryEpisode({ season: season._id, number: number - 1 });

        if (!prevEpisode && number !== 1) {
            // return error if previous episode does not exist
            // first episode does not need a previous episode
            res.status(400).json({
                error:
                    `Previous episode ${number - 1} not found in season ${season.name}`
            });
            return;
        }

        // check if episode already exists
        const checkEpisode = await Episode.findOne({ season: season._id, number: number });

        if (checkEpisode) {
            // return error if episode already exists
            res.status(400).json({
                error:
                    `Episode ${number} already exists in season ${season.name}`
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
        let episode = await Episode.findOneAndUpdate(
            { season: season._id, number: number },
            updatedEpisode,
            { new: true }
        );

        if (!episode) {
            // return error if episode not found
            res.status(400).json({ error: `Episode ${number} not found in season ${season.name}` });
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
        const players = await queryPlayersSeason({ season: season._id });

        if (players.length === 0) {
            // return error if players not found
            res.status(400).json({ error: `No players found in season ${season.name}` });
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
        // get the playerID
        const player = await Player.findOne({ name: name });
        // get the player from the season
        let playerSeason = await queryPlayersSeason({ season: season._id, player: player._id });

        if (!playerSeason) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found in season ${season.name}` });
            return;
        }

        res.json(playerSeason);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/playersSeasons/:name", async (req, res) => {
    try {
        const { name } = req.params;
        // get the seasonID
        const seasons = await Season.find({});
        // get the playerID
        const player = await Player.findOne({ name: name });
        // get the list of seasons for the player
        const playersSeasons = await PlayersSeason.find({ player: player._id })

        if (playersSeasons.length === 0) {
            // return error if players not found
            res.status(400).json({ error: `No seasons found for player ${name}` });
            return;
        }

        // map the seasonID to season names
        const seasonStrings = seasons.filter((season) =>
            playersSeasons.some((playerSeason) => playerSeason.season.equals(season._id)))
            .map((season) => season.name);

        res.json(seasonStrings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/:seasonName/player/draft", async (req, res) => {
    try {
        const { seasonName } = req.params;
        const { name, draft } = req.body;
        // get the seasonID
        const season = await findSeason(seasonName);
        // get the playerID
        const player = await Player.findOne({ name: name });
        // get the player from the season
        let playerSeason = await queryPlayersSeason({ season: season._id, player: player._id });

        if (!playerSeason) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found in season ${season.name}` });
        }

        // remap draft names to survivor IDs
        const draftPromises = Object.keys(draft).map(async (key) => {
            const survivor = await Survivor.findOne({ name: draft[key] });
            if (survivor) {
                draft[key] = survivor._id;
            }
        });
        await Promise.all(draftPromises);

        playerSeason.draft = draft;
        playerSeason.survivors = draft.survivor ? [draft.survivor] : [];

        const updatedPlayer = await playerSeason.save();
        res.json(updatedPlayer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/:seasonName/player/changeSurvivor", async (req, res) => {
    try {
        const { change, name } = req.body;
        const { seasonName } = req.params;
        // get the seasonID
        const season = await findSeason(seasonName);
        // get the playerID
        const player = await Player.findOne({ name: name });
        // get the player from the season
        let playerSeason = await queryPlayersSeason({ season: season._id, player: player._id });

        if (!playerSeason) {
            // return error if player not found
            res.status(400).json({
                error: `Player ${playerName} not found in season ${season.name}`
            });
            return;
        }

        // find the survivor by name
        const survivor = await Survivor.findOne({ season: season._id, name: change.survivor });

        if (!survivor) {
            // return error if survivor not found
            res.status(400).json({
                error: `Survivor ${change.survivor} not found in season ${season.name}`
            });
            return;
        }

        // check if this is a new change an updated change
        const oldChange = player.survivors.findIndex((surv) => surv.episode === change.episode);

        if (oldChange > -1) {
            // if the change already exists, update the survivorID
            playerSeason.survivors[oldChange].survivor = survivor._id;
        } else {
            // if the change does not exist, add the change to the player's survivor list
            playerSeason.survivors.push({ survivor: survivor._id, episode: change.episode });
        }

        // update the player's survivor list
        const updatedPlayer = await player.save();
        res.json(updatedPlayer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/:seasonName/player/changeColor", async (req, res) => {
    try {
        const { seasonName } = req.params;
        const { name, newColor } = req.body;
        const season = await findSeason(seasonName);
        // get the playerID
        const player = await Player.findOne({ name: name });
        // get the player from the season
        let playerSeason = await PlayersSeason.findOne({ season: season._id, player: player._id });

        if (!playerSeason) {
            // return error if player not found
            res.status(400).json({
                error: `Player ${playerName} not found in season ${season.name}`
            });
            return;
        }

        // update player color and save
        playerSeason.color = newColor;
        const updatedPlayer = await PlayersSeason.findOneAndUpdate(
            { season: season._id, player: player._id },
            playerSeason,
            { new: true }
        );
        res.json(updatedPlayer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

//#endregion

//#region player routes
// TODO: use passport.js for authentication
app.post("/api/player/login", async (req, res) => {
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
            res.json({ player: player, login: true });
            return;
        }

        res.status(400).json({ error: "Player Name and Password combination not found." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/player/login/rememberMe", async (req, res) => {
    try {
        var { name, token } = req.body;
        const player = await Player.findOne({ name: name });

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${name} not found` });
            return;
        }

        if (player.validation(token, player.rememberMeToken)) {
            res.json({ player: player, login: true });
            return;
        }
        res.status(400).json({ error: "Login information not found." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/player/rememberMe", async (req, res) => {
    try {
        const { name, token } = req.body;
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
app.post("/api/player/changePassword", async (req, res) => {
    try {
        const { name, newPassword, oldPassword } = req.body;
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
app.get("/api/player/:name/isAdmin", async (req, res) => {
    try {
        // find a player by name
        const player = await Player.findOne({ name: req.params.name });

        if (!player) {
            // return error if player not found
            res.status(400).json({ error: `Player ${req.params.name} not found` });
            return;
        }

        // return if player is an admin
        res.json({ isAdmin: player.isAdmin });
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
        const survivors = await Survivor.find({ season: season._id })
            .select("-_id")
            .exec();
        if (!survivors) {
            // return error if survivors not found
            res.status(400).json({ error: `No survivors found in season ${season.name}` });
            return;
        }

        res.json(survivors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/:seasonName/survivor/:name", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        const survivor = await Survivor.findOne({ season: season._id, name: req.params.name })
            .select("-_id -season")
            .exec();

        if (!survivor) {
            // return error if survivor not found
            res.status(400).json({ error: `Survivor ${req.params.name} not found` });
            return;
        }

        res.json(survivor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
app.post("/api/:seasonName/survivor/new", async (req, res) => {
    try {
        const { seasonName } = req.params;
        // get the seasonID
        const season = await findSeason(seasonName);
        // check if survivor already exists
        const checkSurvivor = await Survivor.findOne({ name: req.body.name, season: season._id });

        if (checkSurvivor) {
            // return error if survivor already exists
            res.status(400).json({
                error:
                    `Survivor ${req.body.name} already exists in season ${season.name}`
            });
            return;
        }

        // create new survivor
        const newSurvivor = new Survivor({ ...req.body, season: season._id });
        // save new survivor
        await newSurvivor.save();
        res.json(newSurvivor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
//#endregion

// tribe routes
app.get("/api/:seasonName/tribes", async (req, res) => {
    try {
        // get the seasonID
        const season = await findSeason(req.params.seasonName);
        const tribes = await Tribe.find({ season: season._id })
            .select("-_id -season")
            .exec();

        if (!tribes) {
            // return error if tribes not found
            res.status(400).json({ error: `No tribes found in season ${season.name}` });
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
        const tribe = await Tribe.find({ season: season._id, name: req.params.name })
            .select("-_id -season")
            .exec();

        if (!tribe) {
            // return error if tribe not found
            res.status(400).json({
                error: `Tribe ${req.params.name} ` +
                    `not found in season ${season.name}`
            });
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
        const checkTribe = await Tribe.findOne({ name: tribeName, season: season._id });
        if (checkTribe) {
            // return error if tribe already exists
            res.status(400).json({
                error: `Tribe ${tribeName} already exists in season ${season.name}`
            });
            return;
        }

        // create new tribe
        const newTribe = new Tribe({ name: tribeName, color: tribeColor, season: season._id });
        // save new tribe
        await newTribe.save();
        res.json(newTribe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

//#endregion
