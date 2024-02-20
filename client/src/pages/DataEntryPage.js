import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import GameData from "../utils/gameData";
import { fetchSeasons } from "../utils/miscUtils";

import NewEpisodeEntry from "../components/NewEpisodeEntryComp";
import EpisodeUpdateEntry from "../components/EpisodeUpdateComp";
import NewSurvivorEntry from "../components/NewSurvivorEntryComp";

export default function DataEntryPage(props) {
    var { gameData, updateGameData, loggedIn } = props;

    DataEntryPage.propTypes = {
        gameData: PropTypes.instanceOf(GameData).isRequired,
        updateGameData: PropTypes.func.isRequired,
        loggedIn: PropTypes.string.isRequired,
    };


    var values = gameData.dataEntryValues;
    var airingNow = values.Episodes.find(
        (ep) => ep.episode !== null && ep.episode.aired === 0
    );

    var [seasons, setSeasons] = useState({ seasons: [], defaultSeason: "" });
    var [season, setSeason] = useState({ value: "", label: "" });
    var [selectedEpisode, selectEpisode] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        const verifyAndSelect = async () => {
            if (!loggedIn) {
                navigate("/");
                return;
            }

            const p = await new API().playerIsAdmin(loggedIn).newRequest();
            if (!p.playerIsAdmin.isAdmin) {
                navigate("/");
                return;
            }

            const s = await fetchSeasons(null, setSeasons);
            setSeason(s.defaultSeason);

            if (selectedEpisode) {
                selectEpisode(
                    values.Episodes.find((ep) => ep.value === selectedEpisode.value)
                );
            } else if (airingNow) {
                selectEpisode(airingNow);
            }
        }
        verifyAndSelect();
    }, []);

    const handleDataEntry = (data) => {
        if (data.newEpisode) {
            API.addEpisode(data.newEpisode);
        }
        if (data.updatedEpisode) {
            API.updateEpisode(data.updatedEpisode).then(() => updateGameData());
            if (data.newTribe) {
                API.addTribe(data.newTribe).then(() => updateGameData());
            }
        }
    };

    const dataTypes = [
        { value: "episode", label: "Episode" },
        { value: "survivor", label: "Survivor" },
        { value: "tribe", label: "Tribe" },
        { value: "player", label: "Player" }
    ];
    var [selectedDataType, selectDataType] = useState(dataTypes[0]);

    const episodeSelect = () => {
        return <div>
            <Select
                className="fit-content min-width-20rem"
                id="episodeSelect"
                options={values.Episodes}
                value={selectedEpisode}
                onChange={(value) => selectEpisode(value)}
            />
            {selectedEpisode && (selectedEpisode.value === 0 ?
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
    }

    return (
        <div className="content">
            <div className="centered">
                <div className="survivor-header">Data Entry</div>
                <Select
                    className="fit-content min-width-20rem"
                    id="seasonSelect"
                    options={seasons.seasons}
                    value={season}
                    onChange={(value) => setSeason(value)}
                />
                <Select
                    className="fit-content min-width-20rem"
                    id="dataTypeSelect"
                    options={dataTypes}
                    value={selectedDataType}
                    onChange={(value) => selectDataType(value)}
                />
                <br />
                {selectedDataType.value === "episode" && episodeSelect()}
                {selectedDataType.value === "survivor" && 
                        <NewSurvivorEntry season={season.value} />
                }
            </div>
        </div>
    );
}
