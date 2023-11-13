import React from "react";
import PropTypes from "prop-types";

function SurvivorStats(props) {
  var { stats } = props;

  SurvivorStats.propTypes = {
    stats: PropTypes.object.isRequired,
  };

  return (
    <div className="box centered pad-5 marg-5">
      <div className="survivor-header">Stats</div>
      <div
        className="box"
        style={{
          "--fillColor": "black",
          color: "white",
        }}
      >
        <div className="survivor-body">{stats.points} Points</div>
      </div>
      <h4>Points Per Episode: {stats.ppe > 0 ? stats.ppe.toFixed(2) : ""}</h4>
      <h4>Individual Wins: {stats.indivWins}</h4>
      <h4>Tribe Wins: {stats.tribeWins}</h4>
      <h4>Advantages Found: {stats.advsFound}</h4>
      <h4>Advantages Played: {stats.advsPlayed}</h4>
    </div>
  );
}

export default SurvivorStats;
