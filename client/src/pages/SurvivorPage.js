import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import API from "../utils/api";
import GameData from "../utils/gameData";

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
    new API()
      .all()
      .newRequest()
      .then((res) => {
        var gameData = new GameData(res);
        setEpisodes(gameData.episodes);
        setSurvivor(gameData.survivorByName(survivorName));
      });
  }, [survivorName]);

  return (
    <div className="content">
      <section className="survivor-info">
        <SurvivorInfo survivor={survivor} />
        <SurvivorPhoto survivor={survivor} />
        {survivor.stats ? <SurvivorStats stats={survivor.stats} /> : null}
      </section>
      <Episodes episodes={episodes} survivor={survivor} />
    </div>
  );
}
