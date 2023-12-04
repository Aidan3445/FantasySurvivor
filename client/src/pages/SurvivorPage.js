import React from "react";
import PropTypes from "prop-types";
import { useLoaderData } from "react-router-dom";
import GameData from "../utils/gameData";

import SurvivorInfo from "../components/SurvivorInfoComp";
import SurvivorPhoto from "../components/SurvivorPhotoComp";
import SurvivorStats from "../components/SurvivorStatsComp";
import Episodes from "../components/EpisodesComp";

export default function SurvivorPage(props) {
  var { gameData, survivorName } = props;

  SurvivorPage.propTypes = {
    gameData: PropTypes.instanceOf(GameData).isRequired,
    survivorName: PropTypes.string,
  };

  var loadedPlayer = useLoaderData();
  survivorName = survivorName || loadedPlayer;

  var episodes = gameData.episodes;
  var survivor = gameData.survivorByName(survivorName);

  return (
    <div className="content">
      <section className="survivor-info">
        <div className="info-photo">
          <SurvivorInfo survivor={survivor} />
          <SurvivorPhoto survivor={survivor} />
        </div>
        <SurvivorStats stats={survivor.stats} />
      </section>
      <Episodes episodes={episodes} survivor={survivor} />
    </div>
  );
}
