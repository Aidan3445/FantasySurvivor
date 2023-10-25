import React from "react";
import Game from "../utils/game";

function PlayerStats(props) {
  var { stats, color } = props;
  var stats;

  return (
    <div className="box centered  pad-5 marg-5">
      <div className="survivor-header">Stats</div>
      <div
        className="box"
        style={{
          "--fillColor": color,
          color: Game.isLightColor(color) ? "black" : "white",
        }}
      >
        <div className="survivor-body">{stats.points} Points</div>
      </div>
      <h4>Points Per Episode: {stats.ppe > 0 ? stats.ppe.toFixed(2) : ""}</h4>
      {stats.highestScorer.points > 0 && (
        <h4>
          Best Scorer: {stats.highestScorer.name.split(" ")[0]},{" "}
          {stats.highestScorer.points}
        </h4>
      )}
      <h4>Survivor Count: {stats.survivorCount}</h4>
      <h4>Performance Points: {stats.performancePoints}</h4>
      <h4>Survival Points: {stats.survivalPoints}</h4>
    </div>
  );
}

export default PlayerStats;
