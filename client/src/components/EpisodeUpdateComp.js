import React, { useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { EpisodeComp as Episode } from "../components/EpisodesComp";

function EpisodeUpdateEntryComp(props) {
  var { dataEntry, values, episode } = props;

  var [selectedEvent, setSelectedEvent] = useState([]);
  var [selectedFor, setSelectedFor] = useState([]);
  var [showEliminated, setShowEliminated] = useState(false);

  var [notes, setNotes] = useState("");

  var [advantageName, setAdvantageName] = useState("");
  var [playedOn, setPlayedOn] = useState([]);

  var [displayEpisode, setDisplayEpisode] = useState(episode);

  var pointsForOptions = getOptions(values, episode.number, showEliminated);

  useEffect(() => {
    pointsForOptions = getOptions(values, episode.number, showEliminated);
  }, [episode]);

  useEffect(() => {
    if (selectedFor.length === 0 && selectedEvent.value !== "merged") return;
    var updatedEpisode = episode.copy();

    updatedEpisode = updatedEpisode.addEvent(
      selectedEvent.value,
      selectedFor.map((opt) => opt.value),
      notes,
      values.Survivors.concat(values.Tribes).map((opt) => opt.value),
      advantageName,
      playedOn.map((opt) => opt.value)
    );

    setDisplayEpisode(updatedEpisode);
  }, [selectedFor, selectedEvent, notes, advantageName, playedOn, episode]);

  const updateEpisode = () => {
    if (selectedFor.length === 0 && selectedEvent.value !== "merged") return;

    setSelectedEvent([]);
    setSelectedFor([]);
    setNotes("");
    setAdvantageName("");
    setPlayedOn([]);

    dataEntry({
      updatedEpisode: displayEpisode,
    });
  };

  const animated = makeAnimated();

  const affectedSurvivors = () => {
    if (!selectedFor) return [];
    var affectedList = selectedFor.concat(playedOn);
    var tribeSurvivors = [];
    affectedList = affectedList
      .map((opt) => {
        if (opt.survivor) {
          return opt.survivor;
        }
        tribeSurvivors = tribeSurvivors.concat(
          values.Survivors.filter(
            (survivorOpt) => survivorOpt.survivor.tribe === opt.value
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
            advantageName={advantageName}
            setAdvantageName={setAdvantageName}
            playedOn={playedOn}
            setPlayedOn={setPlayedOn}
            Survivors={values.Survivors.filter(
              (opt) =>
                (opt.survivor.stats.eliminated === 0 ||
                  opt.survivor.stats.eliminated > episode.number) &&
                !displayEpisode.eliminated.includes(opt.value)
            )}
          />
        )}
        <textarea
          className="notes min-width-20rem"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
        <br />
        <button
          className="centered survivor-button fit-content"
          style={{ "--noHoverColor": "green" }}
          onClick={updateEpisode}
        >
          Update Scores
        </button>
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
    advantageName,
    setAdvantageName,
    playedOn,
    setPlayedOn,
    Survivors,
  } = props;

  return (
    <div className="inline-div">
      {additionalFields.map((field, index) =>
        field.survivorSelect ? (
          <Select
            className="min-width-15rem"
            id={`survivorSelect2${index}`}
            options={Survivors}
            value={playedOn}
            onChange={(value) => setPlayedOn(value)}
            isMulti
            key={index}
          />
        ) : (
          <input
            className="min-width-15rem text-input"
            id={`advNameInput${index}`}
            type="text"
            placeholder={field.label}
            value={advantageName}
            onChange={(e) => setAdvantageName(e.target.value)}
            key={index}
          />
        )
      )}
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
    value: "merged",
    label: "Merge",
  },
];

const getOptions = (values, episodeNumber, showEliminated) => {
  var { Survivors, Tribes } = values;

  if (!showEliminated) {
    Survivors = Survivors.filter(
      (opt) =>
        opt.survivor.stats.eliminated === 0 ||
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
    merged: null,
  };
};
