import React from "react";

function SurvivorPhoto(props) {
  var { survivor } = props;

  return (
    <div className="box pad-5 marg-5 photo-container">
      <img
        className="survivor-photo"
        src={survivor.photo}
        alt={survivor.name}
      />
    </div>
  );
}

export default SurvivorPhoto;
