import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import Game from "../utils/game";

import SurvivorInfo from "../components/SurvivorInfoComp";
import SurvivorPhoto from "../components/SurvivorPhotoComp";
import SurvivorStats from "../components/SurvivorStatsComp";
import Episodes from "../components/EpisodesComp";

export default function SurvivorPage(props) {
  var { survivorName } = props;
  var [survivor, setSurvivor] = useState({});
  var [episodes, setEpisodes] = useState([]);

  var loadedPlayer = useLoaderData();
  survivorName = survivorName || loadedPlayer;

  useEffect(() => {
    // can optimize this by making one call to a better helper method
    Game.getSurvivor(survivorName).then((surv) => {
      setSurvivor(surv);
    });

    Game.getEpisodes().then((episodes) => {
      episodes.reverse();
      setEpisodes(episodes);
    });
  }, [survivorName]);


  return (
    <div className="content">
      <section className="survivor-info">
        <SurvivorPhoto survivor={survivor} />
        <SurvivorInfo survivor={survivor} />
        {survivor.stats ? <SurvivorStats stats={survivor.stats} /> : null}
      </section>
      <Episodes episodes={episodes} survivor={survivor} />
    </div>
  );
}
