import React, { useEffect } from "react";
import { smallScreen } from "../utils/screenSize";

export default function Chart(props) {
  var { data, canvasId } = props;

  useEffect(() => {
    drawChart(data, canvasId);
  }, [data, canvasId]);

  var height = 500;
  if (smallScreen) height = 1200;

  return (
    <canvas className="graph" id={canvasId} width={1200} height={height}></canvas>
  );
}

function drawChart(data, canvasId) {
  const canvas = document.getElementById(canvasId);
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;

  // Calculate dimensions
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Clear canvas
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // line width for the graph
  var lineWidth = 10;
  if (smallScreen) lineWidth = 20;
  // height off the bottom of the canvas
  // the distance on the right of the canvas is 1/2 this value
  var chartOffset = 100;
  // set line dash
  context.setLineDash([5, 5]);

  // X axis
  context.beginPath();
  context.strokeStyle = "darkgray";
  context.lineWidth = 5;
  context.moveTo(0, canvasHeight - chartOffset);
  context.lineTo(canvasWidth - chartOffset / 2, canvasHeight - chartOffset);
  context.stroke();
  context.closePath();
  context.font = "50px Survivor";
  context.fillStyle = "black";
  context.textAlign = "center";
  context.fillText("Episode", canvasWidth / 2, canvasHeight);

  // Y axis
  context.beginPath();
  context.strokeStyle = "darkgray";
  context.lineWidth = 5;
  context.moveTo(canvasWidth - chartOffset / 2, 0);
  context.lineTo(canvasWidth - chartOffset / 2, canvasHeight - chartOffset);
  context.stroke();
  context.closePath();

  // get graph scale
  const maxValue = Math.max(...data.map((data) => Math.max(...data.data)));
  const episodeCount = Math.max(...data.map((data) => data.data.length));
  // no episodes means nothing to draw
  if (episodeCount === 0) return;

  // scale the plotting to fit the canvas
  const scale = {
    x: (canvasWidth - chartOffset / 2) / episodeCount,
    y: ((canvasHeight - chartOffset) / maxValue) * 0.9,
  };

  // episode labels
  for (var i = 0; i < episodeCount; i++) {
    context.fillText(i + 1, (i + 1) * scale.x, canvasHeight - chartOffset / 2);
    context.beginPath();
    context.lineWidth = 2;
    context.setLineDash([5, 5]);
    context.moveTo((i + 1) * scale.x, 0);
    context.lineTo((i + 1) * scale.x, canvasHeight - chartOffset);
    context.stroke();
  }

  // reset dash
  context.setLineDash([]);

  // draw the graph
  data.forEach((data) => {
    if (!data.draw) return;

    // convert data to points
    var points = data.data.map((value, episodeIndex) => {
      return {
        x: (episodeIndex + 1) * scale.x,
        y: canvasHeight - chartOffset - value * scale.y,
      };
    });

    // add final point a few pixels to the right of the
    // last point to align the edge vertically
    var lastPoint = points[points.length - 1];
    points.push({ x: lastPoint.x + 1, y: lastPoint.y });

    // draw a full width black line with a thinner colored line on top
    var lines = [
      { width: lineWidth, color: "black" },
      { width: lineWidth - 3, color: data.color },
    ];
    lines.forEach(({ width, color }) => {
      // draw the data
      context.beginPath();

      var prevPoint = { x: -lineWidth, y: canvasHeight - chartOffset };
      context.moveTo(prevPoint.x, prevPoint.y);

      // draw the lines between the data points
      points.forEach(({ x, y }) => {
        context.lineTo(x, y);

        prevPoint = { x, y };
      });

      if (width === lineWidth) {
        // extend black line 1 px past the last point
        context.lineTo(prevPoint.x + 1, prevPoint.y);

        // label the point total
        context.font = "30px Survivor";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.fillText(
          data.data[data.data.length - 1],
          prevPoint.x + 20,
          prevPoint.y
        );
      }

      // finish line drawing
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
      context.closePath();
    });
  });
}
