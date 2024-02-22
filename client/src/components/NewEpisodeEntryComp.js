import React, { useState } from "react";
import PropTypes from "prop-types";
import Episode from "../utils/episode";

function NewEpisodeEntryComp(props) {
    var { dataEntry, nextEpisodeNumber, resetEpisode } = props;

    NewEpisodeEntryComp.propTypes = {
        dataEntry: PropTypes.func.isRequired,
        nextEpisodeNumber: PropTypes.number.isRequired,
        resetEpisode: PropTypes.func.isRequired,
    };

    var [newEpisodeTitle, setNewEpisodeTitle] = useState("");
    var [newEpisodeDate, setNewEpisodeDate] = useState("");
    var [dateFocus, setDateFocus] = useState(false);

    const newEpisode = () => {
        var newEp = {
            number: nextEpisodeNumber,
            title: newEpisodeTitle,
            airDate: newEpisodeDate.toString(),
        };
        dataEntry({
            newEpisode: newEp,
        });
        resetEpisode({
            value: newEp.number,
            label: `${newEp.number}: ${newEp.title} 
            (${new Date(newEp.airDate) < new Date() ? "Aired" : "Not Aired"
                })`,
            episode: new Episode(newEp),
        });
    };

    return (
        <div>
            <input
                className="text-input min-width-20rem"
                id="titleInput"
                type="text"
                placeholder="Episode Title"
                value={newEpisodeTitle}
                onChange={(e) => setNewEpisodeTitle(e.target.value)}
            />

            <div className="inline-div fit-content">
                <input
                    className="text-input width-100"
                    id="dateInput"
                    type={dateFocus ? "date" : "text"}
                    placeholder="Episode Air Date"
                    value={newEpisodeDate}
                    onChange={(e) => setNewEpisodeDate(e.target.value)}
                    onFocus={() => setDateFocus(true)}
                    onBlur={() => setDateFocus(false)}
                />
                <button
                    className="survivor-button"
                    style={{ "--noHoverColor": "yellow" }}
                    onClick={newEpisode}
                >
                    Add Episode
                </button>
            </div>
        </div>
    );
}

export default NewEpisodeEntryComp;
