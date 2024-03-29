import React, { useContext } from "react";
import PropTypes from "prop-types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import WindowContext from "./WindowContext";

export default function Chart(props) {
    var { data } = props;

    Chart.propTypes = {
        data: PropTypes.array.isRequired,
    };

    const { smallScreen, mediumScreen } = useContext(WindowContext);

    if (data.length === 0) return;

    return (
        <div className="rechart-container" style={{ "--fillColor": "white" }}>
            <ResponsiveContainer>
                <LineChart
                    className="survivor-body"
                    data={FormatData(data)}
                    margin={{
                        top: 10,
                        right: 30,
                        left: -20,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="darkgrey" />
                    <XAxis dataKey="episode" />
                    <YAxis />
                    {!mediumScreen && <Tooltip content={<CustomTooltip />} />}
                    {data.map((data, index) => (
                        <Line
                            type="monotone"
                            dataKey={data.name}
                            stroke={data.color}
                            strokeWidth={smallScreen ? 6 : 8}
                            hide={!data.draw}
                            key={index}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function FormatData(data) {
    var formattedData = [{ name: "Start" }];
    data.forEach((data) => {
        formattedData[0][data.name] = 0;

        data.data.forEach((value, episodeIndex) => {
            var episodeNumber = episodeIndex + 1;
            if (!formattedData[episodeNumber]) {
                formattedData[episodeNumber] = {
                    episode: `Ep ${episodeNumber}`,
                };
            }
            formattedData[episodeNumber][data.name] = value;
        });
    });

    return formattedData;
}

function CustomTooltip(props) {
    const { payload, label } = props;

    CustomTooltip.propTypes = {
        payload: PropTypes.array,
        label: PropTypes.string,
    };

    if (!label || !payload) return;

    payload.sort((a, b) => b.value - a.value);

    var firstSet, secondSet;
    if (payload.length > 9) {
        firstSet = payload.slice(0, payload.length / 2 + 1);
        secondSet = payload.slice(payload.length / 2);
    } else {
        firstSet = payload;
        secondSet = [];
    }

    return (
        <div className="box" style={{ "--fillColor": "rgb(255, 255, 255, 0.85)" }}>
            <div>{label}:</div>
            <hr />
            <div className="inline-div pad-5">
                <div>
                    {firstSet.map((p) => (
                        <div key={p.dataKey} style={{ color: p.stroke, stroke: "black" }}>
                            {p.dataKey}: {p.value}
                        </div>
                    ))}
                </div>
                {secondSet.length > 0 && (
                    <div>
                        {secondSet.map((p) => (
                            <div key={p.dataKey} style={{ color: p.stroke, stroke: "black" }}>
                                {p.dataKey}: {p.value}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <br />
        </div>
    );
}
