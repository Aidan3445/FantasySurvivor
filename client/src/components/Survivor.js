import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Users(props) {
  const [survivors, setSurvivors] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:1332/api/survivors")
      .then((res) => {
        setSurvivors(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  var photoDivStyle = {
    width: "250px",
    height: "250px",
    overflow: "hidden",
    position: "relative",
    margin: "auto",
  };

  var photoStyle = {
    width: "100%" /* Ensure the image covers the container */,
    height: "100%",
    "objectFit": "cover" /* Crop the image to cover the container */,
    "objectPosition": "top left" /* Crop from the top-left corner */,
    position: "absolute" /* Position the image within the container */,
    top: 0,
    left: 0,
  };

  return (
    <div>
      <h1 className="survivor-header">Survivors</h1>
      <ul>
        {survivors.map((survivor, index) => (
          <div key={`div${index}`}>
            <ul key={`list${index}`}>
              {Object.keys(survivor).map((key) => {
                if (key === "photo") {
                  return (
                    <div key={`photoDiv${index}`} style={photoDivStyle}>
                      <img
                        key={`photo${index}`}
                        src={survivor[key]}
                        style={photoStyle}
                        alt={survivor.name}
                      />
                    </div>
                  );
                } else {
                  return (
                    <li key={key} className="survivor-body">
                      {key}: {survivor[key]}
                    </li>
                  );
                }
              })}
            </ul>
            <br key={`break${index}`} />
          </div>
        ))}
      </ul>
    </div>
  );
}
