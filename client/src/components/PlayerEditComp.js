import React, { useEffect, useState } from "react";
import Game from "../fantasy/game";
import Modal, {
  ColorModalContent,
  PasswordModalContent,
  SurvivorSelectContent,
} from "../components/ModalComp";

function PlayerEdit(props) {
  var { player, setPlayer, loggedIn } = props;
  var [modalOpen, setModalOpen] = useState(false);
  var [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    if (player.stats && player.stats.needsSurvivor) {
      openModal(
        <SurvivorSelectContent
          player={player}
          setNewSurvivor={setNewSurvivor}
          setModalOpen={setModalOpen}
        />
      );
    }
  }, [player]);

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (player.stats.needsSurvivor) return;
    setModalContent(null);
    setModalOpen(false);
  };

  const setColor = (color) => {
    setPlayer({ ...player, color });
  };

  const setNewSurvivor = (survivor) => {
    setPlayer({
      ...player,
      survivorList: [...player.survivorList.slice(0, -1), survivor],
    });
  };

  const getStyleColors = () => {
    return {
      "--noHoverColor": player.color,
      color: Game.isLightColor(player.color) ? "black" : "white",
    };
  };

  return (
    <div>
      <div className="centered">
        <div
          className="survivor-header"
          onClick={() => {
            if (player.isAdmin && loggedIn === player.name)
              navigate("/DataEntry");
          }}
        >
          {player.name}
        </div>
        {loggedIn === player.name ? (
          <div className="vertical-div">
            <br />
            <button
              className="survivor-button width-100"
              style={getStyleColors()}
              onClick={() => {
                openModal(
                  <SurvivorSelectContent
                    player={player}
                    setNewSurvivor={setNewSurvivor}
                    setModalOpen={setModalOpen}
                  />
                );
              }}
            >
              Change Survivor
            </button>
            <div className="inline-div">
              <button
                className="survivor-button width-100"
                style={getStyleColors()}
                onClick={() => {
                  openModal(
                    <ColorModalContent
                      color={player.color}
                      setColor={setColor}
                      playerName={player.name}
                      setModalOpen={setModalOpen}
                    />
                  );
                }}
              >
                Change Color
              </button>
              <button
                className="survivor-button width-100"
                style={getStyleColors()}
                onClick={() =>
                  openModal(
                    <PasswordModalContent
                      playerName={player.name}
                      setModalOpen={setModalOpen}
                    />
                  )
                }
              >
                Change Password
              </button>
            </div>
          </div>
        ) : (
          <div className="survivor-body">
            <br />
            <div>Log in to choose a new survivor</div>
            <div>or to edit your color and password.</div>
          </div>
        )}
      </div>
      <Modal
        isOpen={modalOpen}
        closeModal={closeModal}
        content={modalContent}
      />
    </div>
  );
}

export default PlayerEdit;
