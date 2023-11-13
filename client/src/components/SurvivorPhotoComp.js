import React from "react";
import PropTypes from "prop-types";

function SurvivorPhoto(props) {
  var { survivor } = props;

  SurvivorPhoto.propTypes = {
    survivor: PropTypes.object.isRequired,
  };

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
