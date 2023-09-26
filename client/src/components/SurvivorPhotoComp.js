import React from "react";

function SurvivorPhoto(props) {
  var { survivor } = props;

  return (
    <div className="photo-container">
      <img
        className="survivor-photo"
        src={survivor.photo}
        alt={survivor.name}
      />
    </div>
  );
}

export default SurvivorPhoto;
