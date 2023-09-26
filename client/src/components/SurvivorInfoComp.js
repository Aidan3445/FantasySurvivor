import React from "react";

function SurvivorInfo(props) {
  var { survivor } = props;

  return (
    <div className="survivor-info">
      <div className="survivor-header">{survivor.name}</div>
      <h3>Age: {survivor.age}</h3>
      <h3>From: {survivor.hometown}</h3>
      <h3>Lives in: {survivor.residence}</h3>
      <h3>Job: {survivor.job}</h3>
      <h3>
        <a href={survivor.interview} rel="noreferrer" target="_blank">
          EW Interview
        </a>
      </h3>
    </div>
  );
}

export default SurvivorInfo;
