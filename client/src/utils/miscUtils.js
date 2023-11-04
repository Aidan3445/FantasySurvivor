import tinyColor from "tinycolor2";
import API from "./api";
import { nanoid } from "nanoid";

// get running point total
function getRunningPoints(episodePoints) {
  var runningPoints = episodePoints.reduce(
    (points, val) => {
      var last = points[points.length - 1];
      return points.concat(last + val);
    },
    [0]
  );
  runningPoints.shift();

  return runningPoints;
}

// delay function for canvas fonts to load
async function DelayedChart(playerId, survivorId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ players: playerId, survivors: survivorId });
    }, 10);
  });
}

// determine if a color is light or dark
function isLightColor(color) {
  return tinyColor(color).isLight();
}

// sort array of objects by a player or survivor's points
Array.prototype.memberSort = function () {
  return this.sort((a, b) => b.stats.points - a.stats.points);
};

// need to update this to store hashed password
// save login safely
function saveLogin(playerName) {
  var token = nanoid(32);
  localStorage.setItem("playerName", playerName);
  localStorage.setItem("rememberMeToken", token);
  API.remberMe(playerName, token);
}

// remove login safely
function removeLogin() {
  localStorage.removeItem("playerName");
  localStorage.removeItem("rememberMeToken");
}

export { getRunningPoints, DelayedChart, isLightColor, saveLogin, removeLogin };
