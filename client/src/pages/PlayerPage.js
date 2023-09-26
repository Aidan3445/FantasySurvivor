import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import Game from "../fantasy/game";

import PlayerStats from "../components/PlayerStatsComp";
import SideBets from "../components/SideBetsComp";
import Scoreboard from "../components/ScoreboardComp";
import Modal, {
  ColorModalContent,
  PasswordModalContent,
  SurvivorSelectContent,
} from "../components/ModalComp";
import SurvivorPage from "./SurvivorPage";

export default function PlayerPage(props) {
  var { loggedIn, playerName } = props;
  var loadedPlayer = useLoaderData();
  playerName = playerName || loadedPlayer;

  var [player, setPlayer] = useState({});
  var [selectedSurvivor, setSelectedSurvivor] = useState("");
  var [episodeEntries, setEpisodeEntries] = useState([]);
  var [betOutcomes, setBetOutcomes] = useState({
    firstBoot: [],
    firstJurror: [],
    mostAdvantages: [],
    winner: [],
    mostIndividualImmunities: [],
    firstLoser: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    // optimize this by making one call to a better helper method
    Game.getPlayer(playerName).then((player) => {
      if (loggedIn === playerName && player.survivorList.length === 0) {
        navigate(`/Draft`);
      }

      setPlayer(player);
      if (player.stats.needsSurvivor) {
        openModal(
          <SurvivorSelectContent
            player={player}
            setNewSurvivor={setNewSurvivor}
            setModalOpen={setModalOpen}
          />
        );
      }

      Game.getSideBets().then((bets) => {
        setBetOutcomes(bets);
      });
    });
  }, [playerName, loggedIn]);

  useEffect(() => {
    setEpisodeEntries(updateEntries());
  }, [player]);

  var episodeHeaders = [
    "Episode",
    "Survivor",
    "Performance Points",
    "Survival Points",
    "Episode Total",
    "Season Total",
  ];
  const updateEntries = () => {
    return player.survivorList && player.stats && !player.stats.needsSurvivor
      ? player.survivorList.map((survivor, index) => {
          if (!survivor) return {};

          var performancePoints = player.stats.performanceByEp[index];
          var survivalPoints = player.stats.survivalByEp[index];
          var total = player.stats.episodeTotals[index];
          return {
            data: [
              survivor.name,
              performancePoints,
              survivalPoints,
              performancePoints + survivalPoints,
              total,
            ],
            color: survivor.color,
          };
        })
      : [];
  };

  const displaySurvivor = (selected, clickName) => {
    if (selected.includes(clickName)) {
      setSelectedSurvivor("");
      return [];
    }
    setSelectedSurvivor(clickName);
    return [clickName];
  };

  var [modalOpen, setModalOpen] = useState(false);
  var [modalContent, setModalContent] = useState(null);

  const setColor = (color) => {
    setPlayer({ ...player, color });
  };

  const setNewSurvivor = (survivor) => {
    setPlayer({
      ...player,
      survivorList: [...player.survivorList.slice(0, -1), survivor],
    });
  };

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (player.stats.needsSurvivor) return;
    setModalContent(null);
    setModalOpen(false);
  };

  return (
    <div className="content">
      <div className="flex-div">
        <div className="centered">
          <div
            className="survivor-header"
            onClick={() => {
              if (player.isAdmin && loggedIn === playerName)
                navigate("/DataEntry");
            }}
          >
            {player.name}
          </div>
          {loggedIn === playerName ? (
            <div className="vertical-div">
              <br />
              <button
                className="survivor-button width-100"
                style={{ "--noHoverColor": player.color }}
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
                  style={{ "--noHoverColor": player.color }}
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
                  style={{ "--noHoverColor": player.color }}
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
        {player.stats && <PlayerStats stats={player.stats} />}
        {player.draft && (
          <SideBets
            bets={player.draft}
            outcomes={betOutcomes}
            openModal={openModal}
          />
        )}
      </div>
      <Scoreboard
        headers={episodeHeaders}
        entries={episodeEntries}
        handleSelect={displaySurvivor}
      />
      {selectedSurvivor ? (
        <SurvivorPage
          survivorName={selectedSurvivor}
          pickedEpisodes={player.survivorList
            .map((survivor) => {
              return survivor.name === selectedSurvivor;
            })
            .reverse()}
        />
      ) : (
        <div className="survivor-body">
          Click on a survivor&rsquo;s name on the scoreboard to display their
          point info.
        </div>
      )}
      <Modal
        isOpen={modalOpen}
        closeModal={closeModal}
        content={modalContent}
      />
    </div>
  );
}
