import React, { useState, useEffect } from "react";
import Select from "react-select";
import API from "../utils/api";
import GameData from "../utils/gameData";

import NewEpisodeEntry from "../components/NewEpisodeEntryComp";
import EpisodeUpdateEntry from "../components/EpisodeUpdateComp";

export default function DataEntryPage() {
  var [values, setValues] = useState({
    SurvivorNames: [],
    TribeNames: [],
    Episodes: [],
    Survivors: [],
  });

  React.useEffect(() => {
    getEntryValues();
  }, []);

  const getEntryValues = () =>
    new API()
      .all()
      .newRequest()
      .then((res) => {
        var gameData = new GameData(res);
        setValues(gameData.dataEntryValues);
      });

  const handleDataEntry = (data) => {
    if (data.newEpisode) {
      API.addEpisode(data.newEpisode);
    }
    if (data.updatedEpisode) {
      API.updateEpisode(data.updatedEpisode).then(() => getEntryValues());
      if (data.newTribe) {
        API.addTribe(data.newTribe);
      }
    }
  };

  useEffect(() => {
    var airingNow = values.Episodes.find(
      (ep) => ep.episode !== null && ep.episode.aired === 0
    );
    if (selectedEpisode) {
      selectEpisode(
        values.Episodes.find((ep) => ep.value === selectedEpisode.value)
      );
    } else if (airingNow) {
      selectEpisode(airingNow);
    }
  }, [values]);

  var [selectedEpisode, selectEpisode] = useState(null);

  const followUp = () => {
    if (selectedEpisode.value === 0) {
      return (
        <NewEpisodeEntry
          dataEntry={handleDataEntry}
          nextEpisodeNumber={values.Episodes.length}
          resetEpisode={selectEpisode}
        />
      );
    }
    return (
      <EpisodeUpdateEntry
        dataEntry={handleDataEntry}
        episode={selectedEpisode.episode}
        values={values}
      />
    );
  };

  return (
    <div className="content">
      <div className="centered">
        <div className="survivor-header">Data Entry</div>
        <Select
          className="fit-content min-width-20rem"
          id="episodeSelect"
          options={values.Episodes}
          value={selectedEpisode}
          onChange={(value) => selectEpisode(value)}
        />
      </div>
      {selectedEpisode && followUp()}
    </div>
  );
}
