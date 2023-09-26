import React from "react";

const InfoButton = (props) => {
  var { infoContent, openModal } = props;

  return (
    <div>
      <div
        className="info-button"
        onClick={() => openModal(infoContent)}
      >
        ?
      </div>
    </div>
  );
};

export default InfoButton;
