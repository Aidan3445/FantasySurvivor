import React from "react";

function SurvivorStats(props) {
  var { stats } = props;
  var stats;

  return (
    <div>
      <div className="survivor-header centered">Stats</div>
      <div className="top-inline-div">
        <ul>
          <h2>Points: {stats.points}</h2>
          <li>
            <h4>
              Points Per Episode: {stats.ppe > 0 ? stats.ppe.toFixed(2) : ""}
            </h4>
          </li>
        </ul>
        <ul>
          <h2>Challenges Won: {stats.wins}</h2>
          <li>
            <h4>Individual Wins: {stats.indivWins}</h4>
          </li>
          <li>
            <h4>Tribe Wins: {stats.tribeWins}</h4>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SurvivorStats;
