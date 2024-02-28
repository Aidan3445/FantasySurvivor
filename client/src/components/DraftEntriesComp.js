import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Select from "react-select";

function DraftEntries(props) {
    const { player, values, updateGameData } = props;

    DraftEntries.propTypes = {
        player: PropTypes.object.isRequired,
        values: PropTypes.object.isRequired,
        updateGameData: PropTypes.func.isRequired,
    };

    const [sideBetOptions, setSideBetOptions] = useState(values.Survivors);

    const [survivor, setSurvivor] = useState(null);
    const [winner, setWinner] = useState(null);
    const [firstBoot, setFirstBoot] = useState(null);
    const [firstJurror, setFirstJurror] = useState(null);
    const [mostIndivImm, setMostIndivImm] = useState(null);
    const [mostAdvs, setMostAdvs] = useState(null);
    const [firstLoser, setFirstLoser] = useState(null);

    const setPick = (pick, previous, updateSurvivor) => {
        var updatedSidebets = sideBetOptions.filter((s) => s.value !== pick.value);
        if (previous) {
            updatedSidebets.push(previous);
        }

        setSideBetOptions(updatedSidebets);

        if (!updateSurvivor) {
            return;
        }

        switch (pick.value) {
            case winner?.value: 
                setWinner(null);
                break;
            case firstBoot?.value: 
                setFirstBoot(null);
                break;
            case firstJurror?.value:
                setFirstJurror(null);
                break;
            case mostIndivImm?.value:
                setMostIndivImm(null);
                break;
            case mostAdvs?.value: 
                setMostAdvs(null);
                break;
            default:
                break;
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
            winner: winner.value,
            firstBoot: firstBoot.value,
            firstJurror: firstJurror.value,
            mostIndividualImmunities: mostIndivImm.value,
            mostAdvantages: mostAdvs.value,
            firstLoser: firstLoser.value,
        };
        API.submitDraft(
            document.getElementById("season-select").innerText,
            player.name, draft).then(() => {
                updateGameData();
                navigate(`/Player/${player.name}`);
            });
    };

    const verifyPicks =
        survivor &&
        firstBoot &&
        winner &&
        firstJurror &&
        mostIndivImm &&
        mostAdvs &&
        firstLoser;

    return (
        <div className="fit-content centered">
            <div className="survivor-header">{player.name}&apos;s Draft:</div>
            <div className="inline-div">
                Select your Survivor:
                <Select
                    className="fit-content min-width-20rem"
                    options={values.AvailableSurvivors}
                    value={survivor}
                    onChange={(value) => {
                        setSurvivor(value);
                        setPick(value, survivor, true);
                    }}
                />
            </div>
            <div className="survivor-header"> Side bets</div>
            <div className="inline-div">
                Select your winner prediction:
                <Select
                    className="fit-content min-width-20rem"
                    options={sideBetOptions}
                    value={winner}
                    onChange={(value) => {
                        setWinner(value);
                        setPick(value, winner);
                    }}
                />
            </div>
            <div className="inline-div">
                Select your first boot prediction:
                <Select
                    className="fit-content min-width-20rem"
                    options={sideBetOptions}
                    value={firstBoot}
                    onChange={(value) => {
                        setFirstBoot(value);
                        setPick(value, firstBoot);
                    }}
                />
            </div>
            <div className="inline-div">
                Select your first jurror prediction:
                <Select
                    className="fit-content min-width-20rem"
                    options={sideBetOptions}
                    value={firstJurror}
                    onChange={(value) => {
                        setFirstJurror(value);
                        setPick(value, firstJurror);
                    }}
                />
            </div>
            <div className="inline-div">
                Select the player who will win the most individual immunities:
                <Select
                    className="fit-content min-width-20rem"
                    options={sideBetOptions}
                    value={mostIndivImm}
                    onChange={(value) => {
                        setMostIndivImm(value);
                        setPick(value, mostIndivImm);
                    }}
                />
            </div>
            <div className="inline-div">
                Select the player who will find the most advantages:
                <Select
                    className="fit-content min-width-20rem"
                    options={sideBetOptions}
                    value={mostAdvs}
                    onChange={(value) => {
                        setMostAdvs(value);
                        setPick(value, mostAdvs);
                    }}
                />
            </div>
            <div className="inline-div">
                Select the player who&apos;s pick you think will go home first:
                <Select
                    className="fit-content min-width-20rem"
                    options={values.DraftOrder.filter(
                        (p) => p.value !== player.name
                    )}
                    value={firstLoser}
                    onChange={(value) => setFirstLoser(value)}
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
