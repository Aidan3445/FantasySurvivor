import React, { useEffect } from "react";

import * as points from "../utils/performancePoints.js";

function Episodes(props) {
  var { episodes, survivor, pickedEpisodes } = props;

  return (
    <div className="episodes">
      <div className="survivor-header">Episode Breakdown</div>
      {episodes.map(
        (episode, index) =>
          survivor.stats &&
          (survivor.stats.eliminated === 0 ||
            survivor.stats.eliminated >= episode.number) && (
            <EpisodeComp
              episode={episode}
              survivor={survivor}
              key={episode.number}
              picked={pickedEpisodes ? pickedEpisodes[index] : false}
            />
          )
      )}
    </div>
  );
}

function EpisodeComp(props) {
  var { episode, survivor, picked } = props;
  useEffect(() => {}, [episode]);

  return (
    <div className="box" style={{ "--fillColor": picked ? "rgb(230, 255, 233)" : "darkgrey" }}>
      <div className="inline-div">
        <div className="survivor-header">Episode {episode.number}</div>
        <div className="survivor-body centered">
          <div>Points Earned: {episode.getPoints(survivor)}</div>
          <hr className="min-height" />
          <div>"{episode.title}"</div>
        </div>
        {episode.eliminated.includes(survivor.name) && (
          <div className="eliminated">Eliminated</div>
        )}
      </div>
      <div>
        <EpisodeNotes episode={episode} survivor={survivor} />
      </div>
      <EpisodeTable episode={episode} survivor={survivor} />
    </div>
  );
}

function EpisodeTable(props) {
  var { episode, survivor } = props;
  return (
    <table>
      <thead>
        <tr>
          <th
            className="tooltip"
            data-tooltip={`${points.advFoundMultiplier} Points`}
          >
            Advs. Found
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.advPlaySelfMultiplier} Points`}
          >
            Adv. Plays Self
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.advPlayOtherMultiplier} Points`}
          >
            Adv. Plays Other
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.badAdvPlayMultiplier} Points`}
          >
            Bad Adv. Plays
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.advEliminatedMultiplier} Points`}
          >
            Advs. Eliminated
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.tribe1stMultiplier} Points`}
          >
            Tribe 1sts
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.tribe2ndMultiplier} Points`}
          >
            Tribe 2nds
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.indivWinMultiplier} Points`}
          >
            Indiv. Wins
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.indivRewardMultiplier} Points`}
          >
            Indiv. Rewards
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.episodeTitleValue} Points`}
          >
            Spoke Ep. Title
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.blindsideMultiplier} Points`}
          >
            Blindside
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.finalThreeValue} Points`}
          >
            Final Three
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.wonFireValue} Points`}
          >
            Won Fire
          </th>
          <th
            className="tooltip"
            data-tooltip={`${points.soleSurvivorValue} Points`}
          >
            Sole Survivor
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {episode.getTableValues(survivor).map((value, index) => (
            <td key={index}>{value}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function EpisodeNotes(props) {
  var { episode, survivor } = props;

  return (
    <ul className="survivor-body">
      {episode.getNotes(survivor).map((note, index) => (
        <li key={index}>{note}</li>
      ))}
    </ul>
  );
}

export default Episodes;

export { EpisodeComp };
