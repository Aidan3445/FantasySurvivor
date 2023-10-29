import React, { useState, useEffect } from "react";
import tinyColor from "tinycolor2";
import Game from "../utils/game";

function Scoreboard(props) {
  var { headers, entries, handleSelect } = props;
  const [selected, setSelected] = useState([]);
  const [multiPage, setMultiPage] = useState(entries.length > 9);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setMultiPage(entries.length > 9);
  }, [entries]);

  const handleClick = (clickName) => {
    if (!handleSelect) return;
    setSelected(handleSelect(selected, clickName));
  };

  const clearSelected = () => {
    if (!handleSelect) return;
    setSelected(handleSelect([""], ""));
  };

  const getStyle = (entry, index) => {
    var fillColor = entry.color;
    if (index % 2 === 1) {
      fillColor = tinyColor(fillColor).darken(5).toString();
    }
    var notSelected = !selected.includes(entry.data[0]);
    if (selected.length > 0 && notSelected) {
      fillColor = tinyColor(fillColor).desaturate(40).toString();
    }
    return {
      color: Game.isLightColor(entry.color) ? "black" : "white",
      "--fillColor": fillColor,
      "--selected": notSelected ? "normal" : "italic",
    };
  };

  const getPage = () => {
    if (multiPage) {
      return entries.slice(page * 9, (page + 1) * 9);
    }
    return entries;
  };

  const changePage = () => {
    setPage(page + (page === 0 ? 1 : -1));
  };

  return (
    <div>
      <table className="scoreboard">
        <thead>
          <tr
            className={selected.length > 0 ? "clickable" : ""}
            onClick={clearSelected}
          >
            {headers.map((header) => (
              <th key={header} style={{ "--fillColor": "white" }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getPage().map((entry, index) => (
            <tr
              className={handleSelect ? "clickable" : ""}
              onClick={() => handleClick(entry.data[0])}
              key={index}
            >
              <td key={index} style={getStyle(entry, 1)}>
                {index + 1 + page * 9}
              </td>
              {entry.data.map((cell, index) => (
                <td key={index} style={getStyle(entry, index)}>
                  {Number.isNaN(cell) ? null : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {multiPage && (
        <button
          className="min-width"
          style={{
            "--min-width": "5rem",
          }}
          onClick={() => changePage()}
        >
          {page === 0 ? "Next ⇨" : "⇦ Prev"}
        </button>
      )}
    </div>
  );
}

export default Scoreboard;
