import React, { useEffect } from "react";

export default function Chart(props) {
  var { data, canvasId } = props;

  useEffect(() => {
    drawChart(data, canvasId);
  }, [data, canvasId]);

  return (
    <canvas className="graph" id={canvasId} width={1200} height={500}></canvas>
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
  // height off the bottom of the canvas
  // the distance on the right of the canvas is 1/2 this value
  var chartOffset = 100;

  // X axis
  context.beginPath();
  context.strokeStyle = "darkgray";
  context.lineWidth = 5;
  context.setLineDash([5, 5]);
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
  context.setLineDash([5, 5]);
  context.moveTo(canvasWidth - chartOffset / 2, 0);
  context.lineTo(canvasWidth - chartOffset / 2, canvasHeight - chartOffset);
  context.stroke();
  context.closePath();

  // reset dash
  context.setLineDash([]);

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
    context.moveTo((i + 1) * scale.x, 0);
    context.lineTo((i + 1) * scale.x, canvasHeight - chartOffset);
    context.stroke();
  }

  // draw the graph
  data.forEach((data) => {
    if (data.draw === false) return;

    // convert data to points
    var points = data.data.map((value, episodeIndex) => {
      return {
        x: (episodeIndex + 1) * scale.x,
        y: canvasHeight - chartOffset - value * scale.y,
      };
    });

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

      // draw the line to the right side of the canvas
      context.lineTo(scale.x * episodeCount, prevPoint.y);

      // finish line drawing
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
      context.closePath();
    });

    // label the point total
    context.font = "30px Survivor";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.fillText(
      data.data[data.data.length - 1],
      canvasWidth - chartOffset / 4,
      canvasHeight -
        chartOffset +
        10 -
        data.data[data.data.length - 1] * scale.y
    );
  });
}
