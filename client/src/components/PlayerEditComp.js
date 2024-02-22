import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { isLightColor } from "../utils/miscUtils";
import API from "../utils/api";
import Modal, {
    ColorModalContent,
    PasswordModalContent,
    SurvivorSelectContent,
    LoginContent,
} from "../components/ModalComp";

function PlayerEdit(props) {
    var { player, gameData, updateGameData, loggedIn, setLoggedIn } = props;

    PlayerEdit.propTypes = {
        player: PropTypes.object.isRequired,
        gameData: PropTypes.object.isRequired,
        updateGameData: PropTypes.func.isRequired,
        loggedIn: PropTypes.string.isRequired,
        setLoggedIn: PropTypes.func.isRequired,
    };

    var [modalOpen, setModalOpen] = useState(false);
    var [modalContent, setModalContent] = useState(<div />);

    useEffect(() => {
        if (player.stats && player.stats.needsSurvivor) {
            openModal(
                <SurvivorSelectContent player={player} setModalOpen={setModalOpen} />
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

    const verifyAdmin = async () => {
        const p = await new API().playerIsAdmin(loggedIn).newRequest();        
        return p.isAdmin && loggedIn === player.name
    };

    return (
        <div
            className="box centered pad-5 marg-5"
            style={{
                "--fillColor": player.color,
                color: isLightColor(player.color) ? "black" : "white",
            }}
        >
            <div
                className="survivor-header"
                onClick={() => {
                    if (verifyAdmin())
                        navigate("/DataEntry");
                }}
                style={{ marginBottom: "15px" }}
            >
                {player.name}
            </div>
            {loggedIn === player.name ? (
                <div className="inline-div">
                    <button
                        className="survivor-button width-100"
                        onClick={() => {
                            openModal(
                                <SurvivorSelectContent
                                    player={player}
                                    setModalOpen={setModalOpen}
                                    gameData={gameData}
                                    updateGameData={updateGameData}
                                />
                            );
                        }}
                    >
                        Survivor
                    </button>
                    <button
                        className="survivor-button width-100"
                        onClick={() => {
                            openModal(
                                <ColorModalContent
                                    color={player.color}
                                    playerName={player.name}
                                    setModalOpen={setModalOpen}
                                    updateGameData={updateGameData}
                                />
                            );
                        }}
                    >
                        Color
                    </button>
                    <button
                        className="survivor-button width-100"
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
            <Modal
                isOpen={modalOpen}
                closeModal={closeModal}
                content={modalContent}
            />
        </div>
    );
}

export default PlayerEdit;
