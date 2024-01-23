import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Select from "./SelectComp.js";

function DraftEntries(props) {
  const { player, values, picks } = props;

  DraftEntries.propTypes = {
    player: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    picks: PropTypes.object.isRequired,
  };

  const [sideBetOptions, setSideBetOptions] = useState(values.Survivors);

  const [survivor, setSurvivor] = useState({});
  const [firstBoot, setFirstBoot] = useState({});
  const [winner, setWinner] = useState({});
  const [firstJurror, setFirstJurror] = useState({});
  const [firstLoser, setFirstLoser] = useState({});

  const setPick = (pick, previous, setCategory, setSurvivor) => {
    setCategory(pick);
    sideBetOptions.filter((s) => s.value !== pick.value);
    if (previous.value) {
      sideBetOptions.push(previous);
    }

    setSideBetOptions(sideBetOptions);

    if (!setSurvivor) {
      return;
    }

    switch (pick.value) {
      case firstBoot.value: {
        setFirstBoot({});
        break;
      }

      case winner.value: {
        setWinner({});
        break;
      }

      case firstJurror.value: {
        setFirstJurror({});
        break;
      }
    }
  };

  const navigate = useNavigate();

  const submitPicks = () => {
    if (!verifyPicks) {
      return;
    }

    const draft = {
      order: player.draft.order,
      survivor: survivor.value,
      firstBoot: firstBoot.value,
      winner: winner.value,
      firstJurror: firstJurror.value,
      firstLoser: firstLoser.value,
    };
    API.submitDraft(player.name, draft).then(() =>
      navigate(`/Player/${player.name}`)
    );
  };

  const verifyPicks =
    survivor.value &&
    firstBoot.value &&
    winner.value &&
    firstJurror.value &&
    firstLoser.value;

  return (
    <div className="fit-content centered">
      <div className="survivor-header">{player.name}&apos;s Draft:</div>
      <div className="inline-div">
        Select your Survivor:
        <Select
          options={values.AvailableSurvivors}
          val={survivor.value && survivor}
          handleChange={(value) => {
            setPick(value, survivor, setSurvivor, true);
          }}
        />
      </div>
      <div className="survivor-header"> Side bets</div>
      <div className="inline-div">
        Select your first boot prediction:
        <Select
          options={sideBetOptions}
          val={firstBoot.value && firstBoot}
          handleChange={(value) => {
            setPick(value, firstBoot, setFirstBoot);
          }}
        />
      </div>
      <div className="inline-div">
        Select your winner prediction:
        <Select
          options={sideBetOptions}
          val={winner.value && winner}
          handleChange={(value) => {
            setPick(value, winner, setWinner);
          }}
        />
      </div>
      <div className="inline-div">
        Select your first jurror prediction:
        <Select
          options={sideBetOptions}
          val={firstJurror.value && firstJurror}
          handleChange={(value) => {
            setPick(value, firstJurror, setFirstJurror);
          }}
        />
      </div>

      <div className="inline-div">
        Select the player who&apos;s pick you think will go home first:
        <Select
          options={values.DraftOrder.filter(
            (p) => p.player.name !== player.name
          )}
          val={firstLoser.value && firstLoser}
          handleChange={(value) => setFirstLoser(value)}
        />
      </div>
      <br />
      {verifyPicks && (
        <div
          className="survivor-button"
          style={{ "--noHoverColor": "green" }}
          onClick={() => submitPicks()}
        >
          Submit Picks
        </div>
      )}
    </div>
  );
}

export default DraftEntries;

// Const mergeSideBets = ();
