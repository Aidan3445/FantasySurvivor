import React, { useEffect } from "react";
import tinycolor from "tinycolor2";
import * as points from "../utils/performancePoints.js";

function Episodes(props) {
  var { episodes, survivor } = props;

  return (
    <div>
      {episodes.map(
        (episode) =>
          survivor.stats &&
          (survivor.stats.eliminated === 0 ||
            survivor.stats.eliminated >= episode.number) && (
            <EpisodeComp
              episode={episode}
              survivor={survivor}
              key={episode.number}
            />
          )
      )}
    </div>
  );
}

function EpisodeComp(props) {
  var { episode, survivor } = props;
  useEffect(() => {}, [episode]);

  return (
    <div
      className="box marg-5"
      style={{
        "--fillColor": survivor.stats.tribeList.findLast(
          (update) => update.episode < episode.number
        ).color,
      }}
    >
      <div className="episode-header">
        <div className="survivor-body bottom-between">
          <div>Episode {episode.number}</div>
          <div>"{episode.title}"</div>
        </div>
        <div className="survivor-body just-right bottom-between">
          <div>{survivor.name}</div>
          <div className="no-wrap">
            Points Earned: {episode.getPoints(survivor)}
          </div>
        </div>
        {episode.eliminated.includes(survivor.name) && (
          <div className="eliminated">Eliminated</div>
        )}
      </div>
      <div className="episode-notes-table">
        <EpisodeNotes episode={episode} survivor={survivor} />
        <EpisodeTable episode={episode} survivor={survivor} />
      </div>
    </div>
  );
}

function EpisodeTable(props) {
  var { episode, survivor } = props;

  if (
    episode.getTableValues(survivor).filter((value) => value && value != "No")
      .length === 0
  ) {
    return null;
  }

  return (
    <div className="episode-table">
      <div className="survivor-body centered">Events</div>
      <table>
        <tbody>
          {episode.getTableValues(survivor).map((value, index) => {
            if (value && value != "No")
              return (
                <tr key={index}>
                  <th
                    className="tooltip"
                    data-tooltip={`${
                      pointsObj[Object.keys(pointsObj)[index]]
                    } Points`}
                  >
                    {Object.keys(pointsObj)[index]}
                  </th>
                  <td
                    style={{
                      backgroundColor: tinycolor(
                        survivor.stats.tribeList.findLast(
                          (update) => update.episode < episode.number
                        ).color
                      )
                        .darken(10)
                        .toString(),
                    }}
                  >
                    {value}
                  </td>
                </tr>
              );
          })}
        </tbody>
      </table>
    </div>
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

const pointsObj = {
  "Advantage Found": points.advFoundMultiplier,
  "Advantage Plays Self": points.advPlaySelfMultiplier,
  "Advantage Plays Other": points.advPlayOtherMultiplier,
  "Bad Advantage Plays": points.badAdvPlayMultiplier,
  "Advantage Eliminated": points.advEliminatedMultiplier,
  "Tribe 1st Place": points.tribe1stMultiplier,
  "Tribe 2nd Place": points.tribe2ndMultiplier,
  "Individual Win": points.indivWinMultiplier,
  "Individual Reward": points.indivRewardMultiplier,
  "Spoke Episode Title": points.episodeTitleValue,
  Blindside: points.blindsideMultiplier,
  "Final Three": points.finalThreeValue,
  "Won Fire": points.wonFireValue,
  "Sole Survivor": points.soleSurvivorValue,
};

export default Episodes;

export { EpisodeComp };
