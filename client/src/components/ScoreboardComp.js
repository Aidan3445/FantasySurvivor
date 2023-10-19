import React, { useState, useEffect } from "react";
import Game from "../fantasy/game";
import tinycolor from "tinycolor2";

function Scoreboard(props) {
  var { headers, entries, handleSelect } = props;
  const [selected, setSelected] = useState([]);

  useEffect(() => {}, [entries]);

  const handleClick = (clickName) => {
    setSelected(handleSelect(selected, clickName));
  };

  const clearSelected = () => {
    setSelected(handleSelect([""], ""));
  };

  const getStyle = (entry) => {
    var fillColor = entry.color;
    var notSelected = !selected.includes(entry.data[0]);
    if (selected.length > 0 && notSelected) {
      fillColor = tinycolor(fillColor).desaturate(50).toString();
    }
    return {
      color: Game.isLightColor(entry.color) ? "black" : "white",
      backgroundColor: fillColor,
      fontStyle: notSelected ? "normal" : "italic",
    };
  };

  return (
    <table className="scoreboard">
      <thead>
        <tr
          className={selected.length > 0 ? "clickable" : ""}
          onClick={clearSelected}
        >
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr
            className="clickable"
            onClick={() => handleClick(entry.data[0])}
            key={index}
            style={getStyle(entry)}
          >
            <td key={index}>{index + 1}</td>
            {entry.data.map((cell, index) => (
              <td key={index}>{Number.isNaN(cell) ? null : cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Scoreboard;
