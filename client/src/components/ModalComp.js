import React, { useEffect, useState } from "react";
import Select from "react-select";
import { SketchPicker } from "react-color";
import Game from "../fantasy/game";
import Episode from "../fantasy/episode.js";

function Modal(props) {
  var { isOpen, closeModal, content } = props;
  if (!isOpen) return null;

  return (
    <div>
      <div className="modal-content">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        {content}
      </div>
      <div className="modal-greyout" />
    </div>
  );
}

// modal content
function LoginContent(props) {
  var { setLoggedIn, setModalOpen } = props;
  var [playerName, setLocalPlayerName] = useState("");
  var [password, setLocalPassword] = useState("");
  var [saveLogin, setSaveLogin] = useState(false);

  var [warningText, setWarningText] = useState("");

  const login = () => {
    if (playerName === "") return;

    Game.login(playerName, password).then((res) => {
      if (res.accepted) {
        setLoggedIn(playerName);
        if (saveLogin) {
          localStorage.setItem("playerName", playerName);
        }
        setModalOpen(false);
        return;
      }
      setWarningText(res.rejected);
      setTimeout(() => {
        setWarningText("");
      }, 3000);

      setLoggedIn("");
    });
  };

  return (
    <div className="centered">
      <div className="survivor-header">Log In</div>
      <div>
        <div className="modal-warning">{warningText}</div>
        <form className="survivor-body">
          <label>
            Player Name:{" "}
            <input
              className="text-input"
              id="username"
              name="username"
              type="text"
              value={playerName}
              onChange={(e) => setLocalPlayerName(e.target.value)}
            />
          </label>
          <label>
            Password:{" "}
            <input
              className="text-input"
              id="password"
              name="password"
              type="text"
              value={password}
              onChange={(e) => setLocalPassword(e.target.value)}
            />
          </label>
        </form>
      </div>
      <br />
      <div className="inline-div">
        Save Login
        <div
          className={`toggle ${saveLogin ? "on" : "off"}`}
          onClick={() => setSaveLogin(!saveLogin)}
        >
          <div className="slider"></div>
        </div>
        <button
          className="survivor-button"
          style={{ "--noHoverColor": "lightgray", width: "fit-content" }}
          onClick={login}
        >
          Log In
        </button>
      </div>
    </div>
  );
}

function SurvivorSelectContent(props) {
  var { player, setNewSurvivor, setModalOpen } = props;

  var [survivor, setSurvivor] = useState(null);
  var [availableSurvivors, setAvailableSurvivors] = useState([]);
  var [canChange, setCanChange] = useState(false);

  var warningText = [
    "Cannot change survivor.",
    "Contact Aidan if you think this is a mistake.",
  ];

  useEffect(() => {
    Game.getEpisodes().then((episodes) => {
      if (
        episodes.length > 0 &&
        !Episode.fromJSON(episodes[episodes.length - 1]).aired
      ) {
        setCanChange(true);
      }
    });

    Game.getAvailableSurvivors().then((availableSurvivors) => {
      if (availableSurvivors.length === 0) {
        setModalOpen(false);
        return;
      }
      setAvailableSurvivors(availableSurvivors);
    });
  }, []);

  const updateSurvivor = () => {
    if (!survivor || !canChange) return;
    Game.updateSurvivorPick(player.name, survivor.value);
    setNewSurvivor(survivor.survivor);
    setModalOpen(false);
  };

  return (
    <div className="centered">
      <div className="survivor-header">Change Survivor</div>
      {canChange ? (
        <div className="centered">
          <Select
            options={availableSurvivors}
            value={survivor}
            onChange={(value) => setSurvivor(value)}
          />
          <br />
          <button
            className="survivor-button"
            style={{ "--noHoverColor": "lightgray", width: "fit-content" }}
            onClick={survivor ? updateSurvivor : null}
          >
            Submit
          </button>
        </div>
      ) : (
        warningText.map((text, index) => (
          <div className="modal-warning" key={index}>
            {text}
          </div>
        ))
      )}
    </div>
  );
}

function ColorModalContent(props) {
  var { color, setColor, playerName, setModalOpen } = props;

  var [localColor, setLocalColor] = useState(color);

  const updateColor = () => {
    Game.updateColor(playerName, localColor);
    setColor(localColor);
    setModalOpen(false);
  };

  const handleColorChange = (color) => {
    setLocalColor(color.hex);
  };

  return (
    <div className="centered">
      <div className="survivor-header">Change Color</div>
      <div className="centered">
        <SketchPicker
          styles={{
            default: {
              picker: {
                position: "relative",
                width: "!important",
              },
            },
          }}
          color={localColor}
          onChange={(color) => handleColorChange(color)}
        />
        <br />
        <button
          className="survivor-button"
          style={{ "--noHoverColor": "lightgray", width: "fit-content" }}
          onClick={updateColor}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function PasswordModalContent(props) {
  var { playerName, setModalOpen } = props;
  var [newPassword, setNewPassword] = useState("");
  var [confirmNewPassword, setConfirmNewPassword] = useState("");

  var [warningText, setWarningText] = useState("");

  const updatePassword = () => {
    Game.updatePassword(playerName, newPassword, confirmNewPassword).then(
      (warning) => {
        if (warning === "success") {
          setModalOpen(false);
          return;
        }
        setWarningText(warning);
        setTimeout(() => {
          setWarningText("");
        }, 3000);
      }
    );
  };

  return (
    <div className="centered">
      <div className="survivor-header">Change Password</div>
      <div>
        <div className="modal-warning">{warningText}</div>
        <form className="survivor-body">
          <label>
            New Password:{" "}
            <input
              className="text-input"
              type="text"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm Password:{" "}
            <input
              className="text-input"
              type="text"
              name="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </label>
        </form>
        <br />
        <button
          className="survivor-button"
          style={{ "--noHoverColor": "lightgray", width: "fit-content" }}
          onClick={updatePassword}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Modal;
export {
  LoginContent,
  SurvivorSelectContent,
  PasswordModalContent,
  ColorModalContent,
};
