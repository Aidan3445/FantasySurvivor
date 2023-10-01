import React from "react";
import InfoButton from "./InfoButton";

function SideBets(props) {
  var { bets, outcomes } = props;

  const getColor = (outcome, bet) => {
    if (outcome.length === 0) {
      return {};
    }
    if (outcome.includes(bet)) {
      return { color: "green" };
    }
    return { color: "red" };
  };

  return (
    <div>
      <div className="inline-div centered">
        <div className="survivor-header">Sidebets</div>
        <InfoButton infoContent={<InfoContent />} />
      </div>
      <div className="inline-div">
        <h4
          className={outcomes.firstBoot.length > 0 ? "tooltip" : ""}
          data-tooltip={outcomes.firstBoot}
          style={getColor(outcomes.firstBoot, bets.firstBoot)}
        >
          First Boot: {bets.firstBoot}
        </h4>
        <h4
          className={outcomes.firstJurror.length > 0 ? "tooltip" : ""}
          data-tooltip={outcomes.firstJurror}
          style={getColor(outcomes.firstJurror, bets.firstJurror)}
        >
          First Jurror: {bets.firstJurror}
        </h4>
        <h4
          className={outcomes.mostAdvantages.length > 0 ? "tooltip" : ""}
          data-tooltip={outcomes.mostAdvantages}
          style={getColor(outcomes.mostAdvantages, bets.mostAdvantages)}
        >
          Most Advantages: {bets.mostAdvantages}
        </h4>
        <h4
          className={outcomes.winner.length > 0 ? "tooltip" : ""}
          data-tooltip={outcomes.winner}
          style={getColor(outcomes.winner, bets.winner)}
        >
          Winner: {bets.winner}
        </h4>
        <h4
          className={
            outcomes.mostIndividualImmunities.length > 0 ? "tooltip" : ""
          }
          data-tooltip={outcomes.mostIndividualImmunities}
          style={getColor(
            outcomes.mostIndividualImmunities,
            bets.mostIndividualImmunities
          )}
        >
          Most Individual Imms: {bets.mostIndividualImmunities}
        </h4>
        <h4
          className={outcomes.firstLoser.length > 0 ? "tooltip" : ""}
          data-tooltip={outcomes.firstLoser}
          style={getColor(outcomes.firstLoser, bets.firstLoser)}
        >
          First Loser: {bets.firstLoser}
        </h4>
      </div>
    </div>
  );
}

function InfoContent() {
  return (
    <div className="survivor-body">
      <div>
        All hit bets are worth 10 points. Bets will turn green when they are hit
        and red when they are missed.
      </div>
      <br />
      <div>
        You can hover over the bets to see the outcome for that bet if it has
        been decided.
      </div>
    </div>
  );
}

export default SideBets;

/*
import React from "react";
import InfoButton from "./InfoButton";

function SideBets(props) {
  var { bets, outcomes } = props;

  const getColor = (outcome, bet) => {
    if (outcome.length === 0) {
      return {};
    }
    if (outcome.includes(bet)) {
      return { color: "green" };
    }
    return { color: "red" };
  };

  return (
    <div>
      <div className="inline-div centered">
        <div className="survivor-header">Sidebets</div>
        <InfoButton infoContent={<InfoContent />} />
      </div>
      <div className="top-inline-div">
        <ul>
          <li>
            <h4
              className={outcomes.firstBoot.length > 0 ? "tooltip" : ""}
              data-tooltip={outcomes.firstBoot}
              style={getColor(outcomes.firstBoot, bets.firstBoot)}
            >
              First Boot: {bets.firstBoot}
            </h4>
          </li>
          <li>
            <h4
              className={outcomes.firstJurror.length > 0 ? "tooltip" : ""}
              data-tooltip={outcomes.firstJurror}
              style={getColor(outcomes.firstJurror, bets.firstJurror)}
            >
              First Jurror: {bets.firstJurror}
            </h4>
          </li>
          <li>
            <h4
              className={outcomes.mostAdvantages.length > 0 ? "tooltip" : ""}
              data-tooltip={outcomes.mostAdvantages}
              style={getColor(outcomes.mostAdvantages, bets.mostAdvantages)}
            >
              Most Advantages: {bets.mostAdvantages}
            </h4>
          </li>
        </ul>
        <ul>
          <li>
            <h4
              className={outcomes.winner.length > 0 ? "tooltip" : ""}
              data-tooltip={outcomes.winner}
              style={getColor(outcomes.winner, bets.winner)}
            >
              Winner: {bets.winner}
            </h4>
          </li>
          <li>
            <h4
              className={
                outcomes.mostIndividualImmunities.length > 0 ? "tooltip" : ""
              }
              data-tooltip={outcomes.mostIndividualImmunities}
              style={getColor(
                outcomes.mostIndividualImmunities,
                bets.mostIndividualImmunities
              )}
            >
              Most Individual Imms: {bets.mostIndividualImmunities}
            </h4>
          </li>
          <li>
            <h4
              className={outcomes.firstLoser.length > 0 ? "tooltip" : ""}
              data-tooltip={outcomes.firstLoser}
              style={getColor(outcomes.firstLoser, bets.firstLoser)}
            >
              First Loser: {bets.firstLoser}
            </h4>
          </li>
        </ul>
      </div>
    </div>
  );
}

function InfoContent() {
  return (
    <div className="survivor-body">
      <div>
        All hit bets are worth 10 points. Bets will turn green when they are hit
        and red when they are missed.
      </div>
      <br />
      <div>
        You can hover over the bets to see the outcome for that bet if it has
        been decided.
      </div>
    </div>
  );
}

export default SideBets;

 */
