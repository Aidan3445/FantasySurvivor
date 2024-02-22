import React, { useState } from "react";
import PropTypes from "prop-types";
import tinyColor from "tinycolor2";
import { isLightColor } from "../utils/miscUtils";

function Scoreboard(props) {
    var { headers, entries, handleSelect, offset } = props;
    Scoreboard.propTypes = {
        headers: PropTypes.array.isRequired,
        entries: PropTypes.array.isRequired,
        handleSelect: PropTypes.func,
        offset: PropTypes.number,
    };

    offset = offset || 0;

    const [selected, setSelected] = useState([]);

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
            color: isLightColor(entry.color) ? "black" : "white",
            "--fillColor": fillColor,
            "--selected": notSelected && !entry.eliminated ? "normal" : "italic",
        };
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
                    {entries.map((entry, index) => (
                        <tr
                            className={handleSelect ? "clickable" : ""}
                            onClick={() => handleClick(entry.data[0])}
                            key={index}
                        >
                            <td key={index} style={getStyle(entry, 1)}>
                                {offset + index + 1}
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
        </div>
    );
}

export default Scoreboard;
