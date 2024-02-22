import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import GameData from "../utils/gameData";
import { fetchSeasons } from "../utils/miscUtils";

import EpisodeSelect from "../components/EpisodeSelectComp";
import NewSurvivorEntry from "../components/NewSurvivorEntryComp";
import TribeEntry from "../components/NewTribeEntryComp";

export default function DataEntryPage(props) {
    var { updateGameData, loggedIn } = props;

    DataEntryPage.propTypes = {
        updateGameData: PropTypes.func.isRequired,
        loggedIn: PropTypes.string.isRequired,
    };

    var [gameData, setGameData] = useState(null);
    var [seasons, setSeasons] = useState({ seasons: [], defaultSeason: "" });
    var [season, setSeason] = useState({ value: "", label: "" });

    const navigate = useNavigate();
    useEffect(() => {
        const verifyAndSelect = async () => {
            if (!loggedIn) {
                navigate("/");
                return;
            }

            const api = new API();

            const p = await api.playerIsAdmin(loggedIn).newRequest();
            if (!p.playerIsAdmin.isAdmin) {
                navigate("/");
                return;
            }

            const s = await fetchSeasons(null, setSeasons);
            setSeason(s.defaultSeason);
        }
        verifyAndSelect();
    }, []);

    useEffect(() => {
        if (season.value) {
            new API().get(season.value).newRequest().then((res) => {
                setGameData(new GameData(res));
            });
        }
    }, [season]);

    const dataTypes = [
        { value: "episode", label: "Episode" },
        { value: "survivor", label: "Survivor" },
        { value: "tribe", label: "Tribe" },
    ];
    var [selectedDataType, selectDataType] = useState(dataTypes[0]);

    const dataSelect = () => {
        switch (selectedDataType.value) {
            case "episode":
                return <EpisodeSelect
                    season={season.value}
                    gameData={gameData}
                    updateGameData={updateGameData} />;
            case "survivor":
                return <NewSurvivorEntry season={season.value} />;
            case "tribe":
                return <TribeEntry season={season.value} gameData={gameData} />;
            default:
                return null;
        }
    };

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
                {gameData && dataSelect()}
            </div>
        </div>
    );
}
