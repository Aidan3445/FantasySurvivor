import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Game from "../utils/game";
import Modal, {
  ColorModalContent,
  PasswordModalContent,
  SurvivorSelectContent,
  LoginContent,
} from "../components/ModalComp";

function PlayerEdit(props) {
  var { player, setPlayer, loggedIn, setLoggedIn } = props;
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

  const navigate = useNavigate();

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (player.stats.needsSurvivor) return;
    setModalContent(null);
    setModalOpen(false);
  };

  const logIn = () => {
    openModal(
      <LoginContent setLoggedIn={setLoggedIn} setModalOpen={setModalOpen} />
    );
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
      "--noHoverColor": "lightgrey",
      color: Game.isLightColor(player.color) ? "black" : "white",
    };
  };

  return (
    <div
      className="box pad-5 marg-5"
      style={{ "--fillColor": player.color }}
    >
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
            <div className="survivor-body">Change:</div>
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
              Survivor
            </button>
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
              Color
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
              Password
            </button>
          </div>
        ) : (
          !loggedIn && (
            <button
              className="survivor-button"
              style={{ "--noHoverColor": "lightgrey" }}
              onClick={() => logIn()}
            >
              Log In
            </button>
          )
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
