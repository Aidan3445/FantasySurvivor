import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../components/SelectComp";
import API from "../utils/api";

function DraftEntries(props) {
  var { player, values } = props;
  var [survivor, setSurvivor] = useState({});
  var [firstBoot, setFirstBoot] = useState({});
  var [winner, setWinner] = useState({});
  var [firstJurror, setFirstJurror] = useState({});
  var [mostAdvantages, setMostAdvantages] = useState({});
  var [mostIndivImm, setMostIndivImm] = useState({});
  var [firstLoser, setFirstLoser] = useState({});

  var [sideBetOpts, setSideBetOpts] = useState(values.Survivors);

  const setPick = (pick, prev, setCategory, setSurvivor) => {
    setCategory(pick);
    sideBetOpts = sideBetOpts.filter((s) => s.value !== pick.value);
    if (prev.value) {
      sideBetOpts.push(prev);
    }

    setSideBetOpts(sideBetOpts);

    if (!setSurvivor) return;
    switch (pick.value) {
      case firstBoot.value:
        setFirstBoot({});
        break;
      case winner.value:
        setWinner({});
        break;
      case firstJurror.value:
        setFirstJurror({});
        break;
      case mostAdvantages.value:
        setMostAdvantages({});
        break;
      case mostIndivImm.value:
        setMostIndivImm({});
        break;
    }
  };

  const navigate = useNavigate();

  const submitPicks = () => {
    if (!verifyPicks) {
      return;
    }
    var draft = {
      order: player.draft.order,
      survivor: survivor.value,
      firstBoot: firstBoot.value,
      winner: winner.value,
      firstJurror: firstJurror.value,
      mostAdvantages: mostAdvantages.value,
      mostIndividualImmunities: mostIndivImm.value,
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
    mostAdvantages.value &&
    mostIndivImm.value &&
    firstLoser.value;

  return (
    <div className="fit-content centered">
      <div className="survivor-header">{player.name}'s Draft:</div>
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
          options={sideBetOpts}
          val={firstBoot.value && firstBoot}
          handleChange={(value) => {
            setPick(value, firstBoot, setFirstBoot);
          }}
        />
      </div>
      <div className="inline-div">
        Select your winner prediction:
        <Select
          options={sideBetOpts}
          val={winner.value && winner}
          handleChange={(value) => {
            setPick(value, winner, setWinner);
          }}
        />
      </div>
      <div className="inline-div">
        Select your first jurror prediction:
        <Select
          options={sideBetOpts}
          val={firstJurror.value && firstJurror}
          handleChange={(value) => {
            setPick(value, firstJurror, setFirstJurror);
          }}
        />
      </div>
      <div className="inline-div">
        Select a survivor you predict will find the most advantages:
        <Select
          options={sideBetOpts}
          val={mostAdvantages.value && mostAdvantages}
          handleChange={(value) => {
            setPick(value, mostAdvantages, setMostAdvantages);
          }}
        />
      </div>
      <div className="inline-div">
        Select a survivor you predict will win the most individual challenges:
        <Select
          options={sideBetOpts}
          val={mostIndivImm.value && mostIndivImm}
          handleChange={(value) => {
            setPick(value, mostIndivImm, setMostIndivImm);
          }}
        />
      </div>
      <div className="inline-div">
        Select the player who's pick you think will go home first:
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
