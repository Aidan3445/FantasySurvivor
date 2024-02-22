import React, { useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import API from "../utils/api";

export default function NewTribeComp(props) {
    var { season, gameData } = props;

    NewTribeComp.propTypes = {
        season: PropTypes.string.isRequired,
        gameData: PropTypes.object.isRequired,
    };

    var [name, setName] = useState("");
    var [color, setColor] = useState("");
    var [selectedSurvivors, setSelectedSurvivors] = useState([]);

    function clearForm() {
        setName("");
        setColor("");
        setSelectedSurvivors([]);
    }

    var remainingSurvivors = gameData?.dataEntryValues?.Survivors.filter(
        (surv) => !gameData.survivorByName(surv.value).tribe);

    return (
        <div className="vertical-div fit-content">
            <input
                className="text-input min-width-20rem"
                id="nameInput"
                type="text"
                placeholder="Survivor Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className="inline-div fit-content">
                <input
                    className="text-input width-100"
                    id="colorInput"
                    type="text"
                    placeholder="Tribe Color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
                <div style={{ height: "2rem", width: "2rem", backgroundColor: color }}></div>
            </div>
            {gameData?.dataEntryValues &&
                <Select
                    className="fit-content min-width-20rem"
                    id="survivorsSelect"
                    options={remainingSurvivors}
                    value={selectedSurvivors}
                    onChange={(value) => setSelectedSurvivors(value)}
                    isMulti
                    isClearable
                />
            }
            {name && color && selectedSurvivors.length > 0 && (
                <button
                    className="survivor-button"
                    onClick={() => {
                        API.addTribe(
                            season,
                            { name, color },
                            selectedSurvivors.map((s) => s.value));
                        clearForm();
                    }}
                >
                    Add Tribe
                </button>
            )}
        </div>
    );

}
