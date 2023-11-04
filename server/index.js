const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const env = require("dotenv");

env.config();
const app = express();

const Episode = require("./models/EpisodeModel");
const Player = require("./models/PlayerModel");
const Survivor = require("./models/SurvivorModel");
const Tribe = require("./models/TribeModel");

mongoose.connect(process.env.DB_CONNECTION_STRING);

app.use(cors());
app.use(express.json());

//#region episode routes
app.get("/api/episodes", (req, res) => {
  Episode.find({})
    .sort({ number: 1 })
    .then((episodes) => res.json(episodes))
    .catch((err) => res.json(err));
});
app.get("/api/episode/:number", (req, res) => {
  Episode.find({ number: req.params.number })
    .then((episodes) => res.json(episodes))
    .catch((err) => res.json(err));
});
app.post("/api/episode/new", (req, res) => {
  var response = {};
  const { number } = req.body;
  if (number === 1) {
    Episode.create(req.body)
      .then((episode) => res.json(episode))
      .catch((err) => res.json(err));
    return;
  }

  Episode.findOne({ number: number - 1 })
    .then((prevEpisode) => {
      if (!prevEpisode) {
        res.json({ error: `Previous episode (${number - 1}) does not exist` });
        return;
      }

      Episode.findOne({ number: number }).then((episode) => {
        if (episode) {
          res.json({ error: `Episode ${number} already exists` });
        } else {
          const newEpisode = new Episode(req.body);

          Player.find({}).then((players) => {
            players.forEach((player) => {
              if (player.survivorList.length !== number - 1) {
                res.json({
                  error: `${player.name} survivor list length (${player.survivorList.length}) does not match episode (${number})`,
                });
                return;
              }
              var currentSurvivor = player.survivorList[number - 2];
              if (currentSurvivor) {
                if (prevEpisode.eliminated.includes(currentSurvivor)) {
                  player.survivorList.push("");
                } else {
                  player.survivorList.push(currentSurvivor);
                }
              }
              player
                .save()
                .then((player) => (response[player.name] = player))
                .catch((err) => {
                  res.json(err);
                  return;
                });
            });
          });

          // wait to save episode until all players saved without error
          newEpisode
            .save()
            .then((episode) => (response.newEp = episode))
            .catch((err) => {
              res.json(err);
              return;
            });
        }
      });
      // must wait to write response until all players have been updated
      res.json(response);
    })
    .catch((err) => res.json(err));
});
app.post("/api/episode/update", (req, res) => {
  const updatedEpisode = req.body;
  Episode.findOneAndUpdate(
    { number: updatedEpisode.number },
    updatedEpisode
  ).then((episode) => res.json(episode));
});
//#endregion

//#region player routes
app.get("/api/players", (req, res) => {
  Player.find({})
    .then((players) => res.json(players))
    .catch((err) => res.json(err));
});
app.get("/api/player/:name", (req, res) => {
  Player.find({ name: req.params.name })
    .then((players) => {
      return res.json(players);
    })
    .catch((err) => res.json(err));
});
app.post("/api/player/:name/draft", (req, res) => {
  const { name } = req.params;
  const draft = req.body;
  Player.findOne({ name: name })
    .then((player) => {
      if (player) {
        player.draft = draft;
        player.survivorList = [draft.survivor];
        player
          .save()
          .then((player) => res.json(player))
          .catch((err) => res.json(err));
      } else {
        res.json({ error: `Player ${name} not found` });
        return;
      }
    })
    .catch((err) => res.json(err));
});
app.get("/api/player/:name/login/:password", (req, res) => {
  var { name, password } = req.params;
  Player.findOne({ name: name })
    .then((player) => {
      if (player && player.validation(password, player.password)) {
        res.json(player);
        return;
      }
      res.json({ error: "Player Name and Password combination not found." });
    })
    .catch((err) => res.json(err));
});
app.get("/api/player/:name/rememberMe/:token", (req, res) => {
  var { name, token } = req.params;
  Player.findOne({ name: name })
    .then((player) => {
      if (player && player.validation(token, player.rememberMeToken)) {
        res.json(player);
        return;
      }
      res.json({ error: "Player Name and Password combination not found." });
    })
    .catch((err) => res.json(err));
});
app.post("/api/player/:name/rememberMe", (req, res) => {
  const { name } = req.params;
  const { token } = req.body;
  Player.findOne({ name: name })
    .then((player) => {
      if (player) {
        player.rememberMeToken = player.generateHash(token);
        player
          .save()
          .then((player) => res.json(player))
          .catch((err) => res.json(err));
      } else {
        res.json({ error: `Player ${name} not found` });
        return;
      }
    })
    .catch((err) => res.json(err));
});
app.post("/api/player/:playerName/changesurvivor/:survivorName", (req, res) => {
  const { playerName, survivorName } = req.params;
  Player.findOne({ name: playerName })
    .then((player) => {
      if (player) {
        player.survivorList[player.survivorList.length - 1] = survivorName;
        player
          .save()
          .then((player) => res.json(player))
          .catch((err) => res.json(err));
      } else {
        res.json({ error: `Player ${playerName} not found` });
        return;
      }
    })
    .catch((err) => res.json(err));
});
app.post("/api/player/:name/password", (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const { name } = req.params;
  Player.findOne({ name: name })
    .then((player) => {
      if (player && player.validation(oldPassword, player.password)) {
        player.password = player.generateHash(newPassword);
        player
          .save()
          .then((player) => res.json(player))
          .catch((err) => res.json(err));
        return;
      }
      res.json({
        error: `Previous password incorrect. Contact Aidan if you need help.`,
      });
    })
    .catch((err) => res.json(err));
});
app.post("/api/player/:name/color", (req, res) => {
  const { newColor } = req.body;
  const { name } = req.params;
  Player.findOne({ name: name })
    .then((player) => {
      if (player) {
        player.color = newColor;
        player
          .save()
          .then((player) => res.json(player))
          .catch((err) => res.json(err));
      } else {
        res.json({ error: `Player ${name} not found` });
        return;
      }
    })
    .catch((err) => res.json(err));
});
//#endregion

//#region survivor routes
app.get("/api/survivors", (req, res) => {
  Survivor.find({})
    .then((survivors) => res.json(survivors))
    .catch((err) => res.json(err));
});
app.get("/api/survivor/:name", (req, res) => {
  Survivor.find({ name: req.params.name })
    .then((survivors) => res.json(survivors))
    .catch((err) => res.json(err));
});
//#endregion

// tribe routes
app.get("/api/tribes", (req, res) => {
  Tribe.find({})
    .then((tribes) => res.json(tribes))
    .catch((err) => res.json(err));
});
app.get("/api/tribe/:name", (req, res) => {
  Tribe.find({ name: req.params.name })
    .then((tribes) => res.json(tribes))
    .catch((err) => res.json(err));
});
app.post("/api/tribe/new/:tribeName", (req, res) => {
  var { tribeName } = req.params;
  var { tribeColor } = req.body;
  Tribe.create({ name: tribeName, color: tribeColor }).then((tribe) => {
    res.json(tribe);
  });
});

//#endregion

app.listen(1332, () => console.log("Server running on port 1332!"));
