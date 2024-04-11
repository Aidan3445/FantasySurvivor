import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import API from "../utils/api";

import NewEpisodeEntry from "../components/NewEpisodeEntryComp";
import EpisodeUpdateEntry from "../components/EpisodeUpdateComp";

export default function EpisodeSelect(props) {
    var { season, gameData, updateGameData } = props;

    EpisodeSelect.propTypes = {
        season: PropTypes.string.isRequired,
        gameData: PropTypes.object.isRequired,
        updateGameData: PropTypes.func.isRequired,
    };

    var [selectedEpisode, selectEpisode] = useState(null);
    var [values, setValues] = useState({ Episodes: [] });

    useEffect(() => {
        if (!gameData) return;

        var v = gameData.dataEntryValues;
        var airingNow = v.Episodes.find(
            (ep) => ep.episode !== null && ep.episode.aired === 0
        );

        setValues(v);

        if (selectedEpisode) {
            selectEpisode(
                v.Episodes.find((ep) => ep.value === selectedEpisode.value)
            );
        } else if (airingNow) {
            selectEpisode(airingNow);
        }

    }, [gameData]);

    const handleDataEntry = async (data) => {
        console.log("data", data);
        if (data.newEpisode) {
            await API.addEpisode(season, data.newEpisode);
        } else if (data.updatedEpisode) {
            await API.updateEpisode(season, data.updatedEpisode);
            if (data.newTribe) {
                await API.addTribe(season, data.newTribe, data.survivors, data.episodeNumber);
            }
        }

        updateGameData();
    };

    return (
        <div>
            <Select
                className="fit-content min-width-20rem"
                id="episodeSelect"
                options={values.Episodes}
                value={selectedEpisode}
                onChange={(value) => selectEpisode(value)}
            />
            {selectedEpisode && values && (selectedEpisode.value === 0 ?
                <NewEpisodeEntry
                    dataEntry={handleDataEntry}
                    nextEpisodeNumber={values.Episodes.length}
                    resetEpisode={selectEpisode}
                />
                :
                <EpisodeUpdateEntry
                    dataEntry={handleDataEntry}
                    episode={selectedEpisode.episode}
                    values={values}
                />)
            }
        </div>
    );
}
