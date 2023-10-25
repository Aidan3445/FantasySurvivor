import React, { useState } from "react";
import Modal from "./ModalComp";

const InfoButton = (props) => {
  var { infoContent } = props;

  var [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="info-button survivor-body" onClick={() => setModalOpen(true)}>
        ?
      </div>
      <Modal
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        content={infoContent}
      />
    </div>
  );
};

export default InfoButton;
