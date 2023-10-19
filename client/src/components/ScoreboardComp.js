import React, { useState, useEffect } from "react";
import tinyColor from "tinycolor2";
import Game from "../fantasy/game";

function Scoreboard(props) {
  var { headers, entries, handleSelect } = props;
  const [selected, setSelected] = useState([]);
  const [multiPage, setMultiPage] = useState(entries.length > 9);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setMultiPage(entries.length > 9);
  }, [entries]);

  const handleClick = (clickName) => {
    setSelected(handleSelect(selected, clickName));
  };

  const clearSelected = () => {
    setSelected(handleSelect([""], ""));
  };

  const getStyle = (entry, index) => {
    var color = entry.color;
    if (window.innerWidth < 800 && index % 2 === 1) color = tinyColor(color).darken(5).toString();
    return {
      "--text": Game.isLightColor(entry.color) ? "black" : "white",
      "--fill": color,
      "--selected": selected.includes(entry.data[0]) ? "italic" : "normal",
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
              <th key={header} style={{ "--fill": "white" }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getPage().map((entry, index) => (
            <tr
              className="clickable"
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
          className="survivor-button"
          style={{ "--noHoverColor": "var(--defaultButton)" }}
          onClick={() => changePage()}
        >
          {page === 0 ? "Next" : "Prev"} Page
        </button>
      )}
    </div>
  );
}

export default Scoreboard;
