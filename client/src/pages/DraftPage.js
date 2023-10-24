import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Game from "../utils/game";

import DraftOrder from "../components/DraftOrderComp";
import DraftEntries from "../components/DraftEntriesComp";

function DraftPage(props) {
  var { loggedIn } = props;

  var [player, setPlayer] = useState({});
  var [values, setValues] = useState({
    Survivors: [],
    Tribes: [],
    AvailableSurvivors: [],
    DraftOrder: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      navigate("/");
      return;
    }

    Game.getDraftValues().then((values) => {
      setValues(values);
    });

    Game.getPlayer(loggedIn).then((player) => {
      setPlayer(player);
    });
  }, [loggedIn]);

  var playersTurn = () => {
    if (!player.draft) return false;

    return (
      player.draft.order ===
      1 + values.DraftOrder.findIndex((p) => p.player.survivorList.length === 0)
    );
  };

  return (
    <div className="content">
      <a
        href="https://survivor.fandom.com/wiki/Survivor_45#:~:text=physical%22%2C%20and%20%22strategic%22.-,Castaways,-Contestant"
        rel="noreferrer"
        target="_blank"
      >
        Learn about this year's castaways
      </a>
      {playersTurn() ? (
        <DraftEntries player={player} values={values} />
      ) : (
        <DraftOrder player={player} draftOrder={values.DraftOrder} />
      )}
    </div>
  );
}

export default DraftPage;
