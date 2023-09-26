import React, { useEffect, useState } from "react";
import Select from "react-select";
import EpisodeUpdateEntry from "./EpisodeUpdateComp";
import NewEpisodeEntry from "./NewEpisodeEntryComp";

function PointSelector(props) {
  var { dataEntry, values, episodeUpdates, setEpisodeUpdates } = props;

  useEffect(() => {}, [values]);

  const formatEpisodeUpdate = (eventName, names, notes) => {
    displayUpdates({
      episode: episodeUpdates.episode,
      survivors: names.map((name) =>
        values.Survivors.find(
          (survivor) => survivor.name === name || survivor.tribe === name
        )
      ),
    });
  };

  const followUp = () => {
    if (episodeUpdates.episode === null) {
      return null;
    } else if (episodeUpdates.episode === 0) {
      return (
        <NewEpisodeEntry
          dataEntry={dataEntry}
          nextEpisodeNumber={values.Episodes.length}
          resetEpisode={setEpisodeUpdates}
        />
      );
    } else {
      return (
        <div>
          <EpisodeUpdateEntry
            dataEntry={dataEntry}
            episodeUpdate={formatEpisodeUpdate}
            values={values}
          />
          <hr />
          {episodeUpdates.survivors.map((survivor) => (
            <Episode
              key={survivor.name}
              episode={updatedEpisode}
              survivor={survivor}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div>
      <div className="fit-content min-width-20rem">
        <Select
          id="episodeSelect"
          options={values.Episodes}
          value={selectedEpisode}
          onChange={(value) => setEpisodeUpdates(value)}
        />
      </div>
      {followUp()}
    </div>
  );
}

export default PointSelector;
