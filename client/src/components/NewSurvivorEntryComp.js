import React, { useState } from "react";
import PropTypes from "prop-types";
import API from "../utils/api";

export default function NewSurvivorEntry(props) {
    var { season } = props;

    NewSurvivorEntry.propTypes = {
        season: PropTypes.string.isRequired,
    };

    var [name, setName] = useState("");
    var [age, setAge] = useState("");
    var [hometown, setHometown] = useState("");
    var [residence, setResidence] = useState("");
    var [job, setJob] = useState("");
    var [photo, setPhoto] = useState("");
    var [interview, setInterview] = useState("");

    function clearForm() {
        setName("");
        setAge("");
        setHometown("");
        setResidence("");
        setJob("");
        setPhoto("");
        setInterview("");
    }

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
            <input
                className="text-input min-width-20rem"
                id="ageInput"
                type="number"
                placeholder="Survivor Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
            />
            <input
                className="text-input min-width-20rem"
                id="hometownInput"
                type="text"
                placeholder="Survivor Hometown"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
            />
            <input
                className="text-input min-width-20rem"
                id="residenceInput"
                type="text"
                placeholder="Survivor Residence"
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
            />
            <input
                className="text-input min-width-20rem"
                id="job"
                type="text"
                placeholder="Survivor Job"
                value={job}
                onChange={(e) => setJob(e.target.value)}
            />
            <input
                className="text-input min-width-20rem"
                id="photo"
                type="text"
                placeholder="Survivor Photo"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
            />
            <input
                className="text-input min-width-20rem"
                id="interview"
                type="text"
                placeholder="Survivor Interview"
                value={interview}
                onChange={(e) => setInterview(e.target.value)}
            />
            {name && age && hometown && residence && job && photo && interview && (
                <button
                    className="survivor-button"
                    onClick={() => {
                        API.addSurvivor(
                            season,
                            {
                                name,
                                age,
                                hometown,
                                residence,
                                job,
                                photo,
                                interview,
                            }
                        ).then(clearForm);
                    }}
                >
                    Add Survivor
                </button>
            )}
        </div>
    );

}
