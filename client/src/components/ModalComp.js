import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { HexColorPicker } from "react-colorful";
import API from "../utils/api";
import GameData from "../utils/gameData";
import { saveLogin } from "../utils/miscUtils";

function Modal(props) {
    var { isOpen, closeModal, content } = props;

    Modal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        closeModal: PropTypes.func.isRequired,
        content: PropTypes.node,
    };

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

    LoginContent.propTypes = {
        setLoggedIn: PropTypes.func.isRequired,
        setModalOpen: PropTypes.func.isRequired,
    };

    var [playerName, setLocalPlayerName] = useState("");
    var [password, setLocalPassword] = useState("");
    var [rememberLogin, setRememberLogin] = useState(false);

    var [warningText, setWarningText] = useState("");

    const login = () => {
        if (playerName === "") return;

        API.login(playerName, password)
            .then((res) => {
                if (res.data?.login) {
                    setLoggedIn(playerName);
                    if (rememberLogin) {
                        saveLogin(playerName, password);
                    }
                    setModalOpen(false);
                    return;
                }
                setWarningText(res.response.data.error);
                setTimeout(() => {
                    setWarningText("");
                }, 3000);

                setLoggedIn("");
            });
    };

    return (
        <div className="centered">
            <div className="survivor-header">Log In</div>
            <br />
            <div>
                <div className="modal-warning">{warningText}</div>
                <form className="survivor-body">
                    <label>
                        Player Name:{" "}
                        <input
                            className="text-input"
                            type="text"
                            autoComplete="username"
                            value={playerName}
                            onChange={(e) => setLocalPlayerName(e.target.value)}
                        />
                    </label>
                    <label>
                        Password:{" "}
                        <input
                            className="text-input"
                            type="password"
                            autoComplete="current-password"
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
                    className={`toggle ${rememberLogin ? "on" : "off"}`}
                    onClick={() => setRememberLogin(!rememberLogin)}
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
    var { player, gameData, setModalOpen, updateGameData } = props;

    SurvivorSelectContent.propTypes = {
        player: PropTypes.object.isRequired,
        gameData: PropTypes.object.isRequired,
        setModalOpen: PropTypes.func.isRequired,
        updateGameData: PropTypes.func.isRequired,
    };

    var [survivor, setSurvivor] = useState(null);
    var [availableSurvivors, setAvailableSurvivors] = useState([]);
    var [canChange, setCanChange] = useState(true);
    var [warningText, setWarningText] = useState([
        "Cannot change survivor.",
        "Contact Aidan if you think this is a mistake.",
    ]);

    useEffect(() => {
        if (
            gameData.episodes.length == 0 ||
            gameData.episodes[gameData.episodes.length - 1].aired != -1
        ) {
            setCanChange(false);
        }

        if (gameData.availableSurvivors.length === 0) {
            warningText[0] = "No available survivors.";
            setWarningText(warningText);
            setCanChange(false);
        } else {
            setAvailableSurvivors(gameData.availableSurvivors);
        }
    }, [gameData]);

    const updateSurvivor = () => {
        if (!survivor || !canChange) return;
        API.updateSurvivorPick(player.name, survivor.value).then(() =>
            updateGameData()
        );
        setModalOpen(false);
    };

    return (
        <div className="centered">
            <div className="survivor-header">Change Survivor</div>
            <br />
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
    var { color, playerName, setModalOpen, updateGameData } = props;

    ColorModalContent.propTypes = {
        color: PropTypes.string.isRequired,
        playerName: PropTypes.string.isRequired,
        setModalOpen: PropTypes.func.isRequired,
        updateGameData: PropTypes.func.isRequired,
    };

    var [localColor, setLocalColor] = useState(color);

    const updateColor = () => {
        API.updateColor(document.getElementById("season-select").innerText,
            playerName, localColor).then(() => updateGameData());
        setModalOpen(false);
    };

    const handleColorChange = (color) => {
        setLocalColor(color);
    };

    return (
        <div className="centered">
            <div className="survivor-header">Change Color</div>
            <br />
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

    PasswordModalContent.propTypes = {
        playerName: PropTypes.string.isRequired,
        setModalOpen: PropTypes.func.isRequired,
    };

    var [oldPassword, setOldPassword] = useState("");
    var [newPassword, setNewPassword] = useState("");
    var [confirmNewPassword, setConfirmNewPassword] = useState("");

    var [warningText, setWarningText] = useState("");

    const updatePassword = () => {
        API.changePassword(
            playerName,
            oldPassword,
            newPassword,
            confirmNewPassword
        ).then((warning) => {
            if (warning === "success") {
                setModalOpen(false);
                return;
            }
            setWarningText(warning);
            setTimeout(() => {
                setWarningText("");
            }, 3000);
        });
    };

    return (
        <div className="centered">
            <div className="survivor-header">Change Password</div>
            <br />
            <div>
                <div className="modal-warning">{warningText}</div>
                <form className="survivor-body">
                    <label>
                        Old Password:{" "}
                        <input
                            className="text-input"
                            type="text"
                            autoComplete="current-password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </label>
                    <label>
                        New Password:{" "}
                        <input
                            className="text-input"
                            id="newPassword"
                            type="text"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </label>
                    <label>
                        Confirm Password:{" "}
                        <input
                            type="text"
                            autoComplete="username"
                            value={playerName}
                            readOnly
                            hidden
                        />
                        <input
                            className="text-input"
                            type="password"
                            autoComplete="new-password"
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
