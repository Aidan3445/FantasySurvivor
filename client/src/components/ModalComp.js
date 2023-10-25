import React, { useEffect, useState } from "react";
import Select from "react-select";
import { HexColorPicker } from "react-colorful";
import Game from "../utils/game";

function Modal(props) {
  var { isOpen, closeModal, content } = props;

  useEffect(() => {
    const handleEscape = (e) => {
      if (isOpen && e.key === "Escape") {
        closeModal();
        document.activeElement.blur();
      }
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            {content}
          </div>
          <div className="modal-greyout" />
        </div>
      )}
    </>
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
          Game.saveLogin(playerName, password);
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
      <br/>
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
              type="password"
              value={password}
              onChange={(e) => setLocalPassword(e.target.value)}
            />
          </label>
        </form>
      </div>
      <br />
      <div className="inline-div">
        Remember Me
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
      if (episodes.length > 0 && episodes[episodes.length - 1].aired === -1) {
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
      <br/>
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
    setLocalColor(color);
  };

  return (
    <div className="centered">
      <div className="survivor-header">Change Color</div>
      <br/>
      <div className="centered">
        <HexColorPicker
          styles={{
            default: {
              picker: {
                position: "relative",
                width: "100%",
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
      <br/>
      <div>
        <div className="modal-warning">{warningText}</div>
        <form className="survivor-body">
          <label>
            New Password:{" "}
            <input
              className="text-input"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm Password:{" "}
            <input
              className="text-input"
              type="text"
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
