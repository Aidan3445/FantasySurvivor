import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { EpisodeComp as Episode } from "../components/EpisodesComp";

function EpisodeUpdateEntryComp(props) {
    var { dataEntry, values, episode } = props;

    EpisodeUpdateEntryComp.propTypes = {
        dataEntry: PropTypes.func.isRequired,
        values: PropTypes.object.isRequired,
        episode: PropTypes.object.isRequired,
    };

    var [selectedEvent, setSelectedEvent] = useState([]);
    var [selectedFor, setSelectedFor] = useState([]);
    var [showEliminated, setShowEliminated] = useState(false);

    var [notes, setNotes] = useState("");

    var [addlField1, setAddlField1] = useState("");
    var [newTribeColor, setNewTribeColor] = useState("");
    var [affected, setAffected] = useState([]);

    var [displayEpisode, setDisplayEpisode] = useState(episode);

    var pointsForOptions = getOptions(values, episode.number, showEliminated);

    useEffect(() => {
        pointsForOptions = getOptions(values, episode.number, showEliminated);
    }, [episode]);

    useEffect(() => {
        var mergeEvent = selectedEvent.value === "merged";
        if (selectedFor.length === 0 && !mergeEvent) return;
        var updatedEpisode = episode.copy();

        var affectedList = affected.map((opt) => opt.value);
        if (selectedEvent.affectAllRemaining)
            affectedList = values.Survivors.filter(
                (opt) => !opt.survivor.stats.eliminated
            ).map((opt) => opt.value);

        updatedEpisode = updatedEpisode.addEvent(
            selectedEvent.value,
            selectedFor.map((opt) => {
                return { name: opt.value, onModel: opt.onModel }
            }),
            notes,
            values.Survivors.concat(values.Tribes).map((opt) => {
                return { name: opt.value, onModel: opt.onModel }
            }),
            affectedList,
            addlField1
        );
        setDisplayEpisode(updatedEpisode);
    }, [
        selectedFor,
        selectedEvent,
        notes,
        addlField1,
        newTribeColor,
        affected,
        episode,
    ]);

    const updateEpisode = () => {
        if (selectedFor.length === 0 && selectedEvent.value !== "merged") return;

        setSelectedEvent([]);
        setSelectedFor([]);
        setNotes("");
        setAddlField1("");
        setNewTribeColor("");
        setAffected([]);

        var newTribe =
            selectedEvent.value === "merged"
                ? {
                    tribeName: addlField1,
                    tribeColor: newTribeColor,
                }
                : null;

        dataEntry({
            updatedEpisode: displayEpisode,
            newTribe: newTribe,
        });
    };

    const animated = makeAnimated();

    const affectedSurvivors = () => {
        if (!selectedFor) return [];
        var affectedList = selectedFor;
        if (values.Survivors.includes(affected[0])) {
            affectedList = affectedList.concat(affected);
        }
        if (selectedEvent.affectAllRemaining) {
            affectedList = values.Survivors.filter(
                (opt) => !opt.survivor.stats.eliminated
            );
        }
        var tribeSurvivors = [];
        affectedList = affectedList
            .map((opt) => {
                if (opt.survivor) {
                    return opt.survivor;
                }
                tribeSurvivors = tribeSurvivors.concat(
                    values.Survivors.filter(
                        (survivorOpt) =>
                            survivorOpt.survivor.tribe === opt.value &&
                            (showEliminated || !survivorOpt.survivor.stats.eliminated)
                    )
                );
                return null;
            })
            .filter((opt) => opt !== null);
        tribeSurvivors = tribeSurvivors.map((opt) => opt.survivor);
        affectedList = affectedList.concat(tribeSurvivors);
        return affectedList;
    };

    return (
        <div>
            <div className="centered">
                <div className="inline-div">
                    <Select
                        className="min-width-15rem"
                        id="eventSelect"
                        options={eventOptions}
                        value={selectedEvent}
                        onChange={(value) => setSelectedEvent(value)}
                    />
                    {pointsForOptions[selectedEvent.value] && (
                        <div className="inline-div">
                            <Select
                                id="pointsForSelect"
                                options={
                                    selectedEvent ? pointsForOptions[selectedEvent.value] : []
                                }
                                value={selectedFor}
                                onChange={(value) => setSelectedFor(value)}
                                components={animated}
                                isMulti
                                isClearable
                            />
                            <div
                                className={`toggle ${showEliminated ? "on" : "off"} tooltip`}
                                onClick={() => setShowEliminated(!showEliminated)}
                                data-tooltip={
                                    showEliminated ? "Show Eliminated" : "Hide Eliminated"
                                }
                            >
                                <div className="slider"></div>
                            </div>
                        </div>
                    )}
                </div>
                {selectedEvent && selectedEvent.additionalFields && (
                    <AdditionalFields
                        additionalFields={selectedEvent.additionalFields}
                        addlField1={addlField1}
                        setAddlField1={setAddlField1}
                        addlField2={newTribeColor}
                        setAddlField2={setNewTribeColor}
                        affected={affected}
                        setAffected={setAffected}
                        Survivors={values.Survivors.filter(
                            (opt) =>
                                (!opt.survivor.stats.eliminated ||
                                    opt.survivor.stats.eliminated > episode.number) &&
                                !displayEpisode.eliminated.includes(opt.value)
                        )}
                        Tribes={values.Tribes}
                    />
                )}
                <textarea
                    className="notes min-width-20rem"
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <br />
                {(selectedFor.length > 0 || selectedEvent.value === "merged") &&
                    <button
                        className="centered survivor-button fit-content"
                        style={{ "--noHoverColor": "green" }}
                        onClick={updateEpisode}
                    >
                        Update Scores
                    </button>
                }
            </div>
            {affectedSurvivors().map((survivor) => {
                return (
                    <div key={survivor.name}>
                        <hr />
                        <div className="survivor-header">{survivor.name}</div>
                        <Episode episode={displayEpisode} survivor={survivor} />
                    </div>
                );
            })}
        </div>
    );
}

function AdditionalFields(props) {
    var {
        additionalFields,
        addlField1,
        setAddlField1,
        addlField2,
        setAddlField2,
        affected,
        setAffected,
        Survivors,
        Tribes,
    } = props;

    AdditionalFields.propTypes = {
        additionalFields: PropTypes.array.isRequired,
        addlField1: PropTypes.string.isRequired,
        setAddlField1: PropTypes.func.isRequired,
        addlField2: PropTypes.string.isRequired,
        setAddlField2: PropTypes.func.isRequired,
        affected: PropTypes.array.isRequired,
        setAffected: PropTypes.func.isRequired,
        Survivors: PropTypes.array.isRequired,
        Tribes: PropTypes.array.isRequired,
    };

    const getAddlField = (index) => {
        if (index === 0) return { val: addlField1, set: setAddlField1 };
        return { val: addlField2, set: setAddlField2 };
    };

    const getField = (field, index) => {
        if (field.survivorSelect) {
            return (
                <Select
                    className="min-width-15rem"
                    id={`survivorSelect2${index}`}
                    options={Survivors}
                    value={affected}
                    onChange={(value) => setAffected(value)}
                    isMulti
                    key={index}
                />
            );
        }
        if (field.tribeSelect) {
            return (
                <Select
                    className="min-width-15rem"
                    id={`tribeSelect2${index}`}
                    options={Tribes}
                    value={affected}
                    onChange={(value) => setAffected([value])}
                    key={index}
                />
            );
        }
        return (
            <input
                className="min-width-15rem text-input"
                id={`advNameInput${index}`}
                type="text"
                placeholder={field.label}
                value={getAddlField(index).val}
                onChange={(e) => getAddlField(index).set(e.target.value)}
                key={index}
            />
        );
    };

    return (
        <div className="inline-div">
            {additionalFields.map((field, index) => getField(field, index))}
        </div>
    );
}

export default EpisodeUpdateEntryComp;

const eventOptions = [
    { value: "notes", label: "Notes Only" },
    {
        value: "tribe2nds",
        label: "Tribe Second Place",
        additionalFields: [
            { value: "advName", label: "Reward? (Leave blank for Imm.)" },
        ],
    },
    {
        value: "tribe1sts",
        label: "Tribe First Place",
        additionalFields: [
            { value: "advName", label: "Reward? (Leave blank for Imm.)" },
        ],
    },
    { value: "spokeEpTitle", label: "Episode Title" },
    {
        value: "advsFound",
        label: "Advantage Found",
        additionalFields: [{ value: "advName", label: "Advantage Name" }],
    },
    { value: "blindsides", label: "Blindside" },
    { value: "indivRewards", label: "Individual Reward" },
    { value: "indivWins", label: "Individual Win" },
    {
        value: "advPlaysSelf",
        label: "Advantage Play Self",
        additionalFields: [{ value: "advName", label: "Advantage Name" }],
    },
    { value: "finalThree", label: "Final Three" },
    { value: "fireWins", label: "Won Fire" },
    {
        value: "advPlaysOther",
        label: "Advantage Play Other",
        additionalFields: [
            { value: "advName", label: "Advantage Name" },
            { value: "played", label: "Played On", survivorSelect: true },
        ],
    },
    { value: "soleSurvivor", label: "Sole Survivor" },
    {
        value: "badAdvPlays",
        label: "Bad Advantage Play",
        additionalFields: [{ value: "advName", label: "Advantage Name" }],
    },
    {
        value: "advsEliminated",
        label: "Advantage Eliminated",
        additionalFields: [{ value: "advName", label: "Advantage Name" }],
    },
    {
        value: "eliminated",
        label: "Eliminated",
        additionalFields: [
            { value: "votesAgainst", label: "Votes Against", survivorSelect: true },
        ],
    },
    {
        value: "tribeSwap",
        label: "Tribe Swap",
        additionalFields: [{ value: "tribe", label: "Tribe", tribeSelect: true }],
    },
    {
        value: "merged",
        label: "Merge",
        additionalFields: [
            { value: "tribeName", label: "Tribe Name" },
            { value: "tribeColor", label: "Tribe Color" },
        ],
        affectAllRemaining: true,
    },
];

const getOptions = (values, episodeNumber, showEliminated) => {
    var { Survivors, Tribes } = values;

    if (!showEliminated) {
        Survivors = Survivors.filter(
            (opt) =>
                !opt.survivor.stats.eliminated ||
                opt.survivor.stats.eliminated > episodeNumber
        );
    }

    return {
        notes: Survivors.concat(Tribes),
        tribe2nds: Tribes.concat(Survivors),
        tribe1sts: Tribes.concat(Survivors),
        spokeEpTitle: Survivors,
        advsFound: Survivors,
        blindsides: Survivors,
        indivRewards: Survivors,
        indivWins: Survivors,
        advPlaysSelf: Survivors,
        finalThree: Survivors,
        fireWins: Survivors,
        advPlaysOther: Survivors,
        soleSurvivor: Survivors,
        badAdvPlays: Survivors,
        advsEliminated: Survivors,
        eliminated: Survivors,
        tribeSwap: Survivors,
        merged: null,
    };
};
