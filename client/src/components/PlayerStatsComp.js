import React from "react";

function PlayerStats(props) {
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
          {stats.highestScorer.points > 0 && (
            <li>
              <h4>
                Best Scorer: {stats.highestScorer.name.split(" ")[0]},{" "}
                {stats.highestScorer.points}
              </h4>
            </li>
          )}
        </ul>
        <ul>
          <h2>Survivor Count: {stats.survivorCount}</h2>
          <li>
            <h4>Performance Points: {stats.performancePoints}</h4>
          </li>
          <li>
            <h4>Survival Points: {stats.survivalPoints}</h4>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PlayerStats;
