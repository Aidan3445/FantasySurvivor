import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import Game from "../fantasy/game";

import SurvivorInfo from "../components/SurvivorInfoComp";
import SurvivorPhoto from "../components/SurvivorPhotoComp";
import SurvivorStats from "../components/SurvivorStatsComp";
import Episodes from "../components/EpisodesComp";

export default function SurvivorPage(props) {
  var { survivorName, pickedEpisodes } = props;
  var [survivor, setSurvivor] = useState({});
  var [tribeColor, setTribeColor] = useState("");
  var [episodes, setEpisodes] = useState([]);

  var loadedPlayer = useLoaderData();
  survivorName = survivorName || loadedPlayer;

  useEffect(() => {
    // can optimize this by making one call to a better helper method
    Game.getSurvivor(survivorName).then((surv) => {
      setSurvivor(surv);

      Game.getTribeColor(surv.tribe).then((color) => {
        setTribeColor(color);
      });
    });

    Game.getEpisodes().then((episodes) => {
      episodes.reverse();
      setEpisodes(episodes);
    });
  }, [survivorName]);

  return (
    <div className="content">
      <div className="flex-div">
        <SurvivorInfo survivor={survivor} />
        <SurvivorPhoto survivor={survivor} />
        <div>
          {survivor.stats ? <SurvivorStats stats={survivor.stats} /> : null}
          <div
            className="color-label centered"
            style={{ background: tribeColor }}
          >
            {survivor.tribe}
          </div>
        </div>
      </div>
      <hr />
      <Episodes
        episodes={episodes}
        survivor={survivor}
        pickedEpisodes={pickedEpisodes}
      />
    </div>
  );
}
