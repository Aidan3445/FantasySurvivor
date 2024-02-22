import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GameData from "../utils/gameData";

import DraftOrder from "../components/DraftOrderComp";
import DraftEntries from "../components/DraftEntriesComp";

function DraftPage(props) {
    var { loggedIn, gameData, updateGameData } = props;

    DraftPage.propTypes = {
        loggedIn: PropTypes.string.isRequired,
        gameData: PropTypes.instanceOf(GameData).isRequired,
        updateGameData: PropTypes.func.isRequired,
    };

    var [player, setPlayer] = useState(null);
    var [allPlayers, setAllPlayers] = useState([]);
    var [nextPick, setNextPick] = useState(0);

    useEffect(() => {
        setPlayer(gameData.playerByName(loggedIn));
        const draftOrder = gameData.players.toSorted((a, b) => a.draft.order - b.draft.order);
        setAllPlayers(draftOrder);
        setNextPick(draftOrder.findIndex((p) => !p.draft.survivor) + 1);
    }, [loggedIn, gameData]);

    return (
        <div className="content">
            <a
                href="https://parade.com/tv/survivor-46-cast/"
                rel="noreferrer"
                target="_blank"
            >
                {"Learn about this year's castaways"}
            </a>
        {nextPick == player?.draft?.order ? (
            <DraftEntries 
                player={player} 
                values={gameData.draftValues} 
                updateGameData={updateGameData}
            />
        ) : (
            <DraftOrder player={player} draftOrder={allPlayers} nextPick={nextPick} />
        )}
        </div>
    );
}

export default DraftPage;
