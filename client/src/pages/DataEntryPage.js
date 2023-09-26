import React, { useState, useEffect } from "react";
import Select from "react-select";
import Game from "../fantasy/game";

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
    Game.getDataEntryValues().then((values) => {
      setValues(values);
    });
  }, []);

  const handleDataEntry = (data) => {
    if (data.newEpisode) {
      Game.AddEpisode(data.newEpisode);
    }
    if (data.updatedEpisode) {
      Game.UpdateEpisode(data.updatedEpisode).then(() =>
        Game.getDataEntryValues().then((values) => {
          setValues(values);
        })
      );
    }
  };

  useEffect(() => {
    if (selectedEpisode) {
      selectEpisode(
        values.Episodes.find((ep) => ep.value === selectedEpisode.value)
      );
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
