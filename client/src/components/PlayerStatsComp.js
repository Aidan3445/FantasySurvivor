import React from "react";
import PropTypes from "prop-types";
import { isLightColor } from "../utils/miscUtils";

function PlayerStats(props) {
  var { stats, color } = props;

  PlayerStats.propTypes = {
    stats: PropTypes.object.isRequired,
    color: PropTypes.string.isRequired,
  };

  return (
    <div className="box centered pad-5 marg-5 split-25-75">
      <div>
        <div className="survivor-header">Stats</div>
        <div
          className="box"
          style={{
            "--fillColor": color,
            color: isLightColor(color) ? "black" : "white",
          }}
        >
          <div className="survivor-body">{stats.points} Points</div>
        </div>
      </div>
      <div className="spread-down">
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
    </div>
  );
}

export default PlayerStats;
