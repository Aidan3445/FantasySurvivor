import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { smallScreen } from "../smallScreen";

export default function Chart(props) {
  var { data } = props;

  if (data.length === 0) return;

  return (
    <div className="rechart-container box" style={{"--fillColor": "white"}}>
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
          <Tooltip
            position={{ y: -100 }}
            itemSorter={(item) => {
              return -item.value;
            }}
          />
          {data.map((data) => (
            <Line
              type="monotone"
              dataKey={data.name}
              stroke={data.color}
              strokeWidth={smallScreen ? 6 : 8}
              hide={!data.draw}
              key={data.name}
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
