import React from "react";

function DraftOrder(props) {
  var { player, draftOrder } = props;

  var drafted = [];
  var notDrafted = [];
  var upNext = null;
  draftOrder.forEach((p) => {
    if (p.player.survivorList.length === 0) {
      notDrafted.push(p);
    } else {
      drafted.push(p);
    }
  });
  upNext = notDrafted.shift();

  const getStyle = (p) => {
    return {
      fontWeight:
        p.player.draft.order <=
        draftOrder.findIndex((p2) => p2.player.survivorList.length === 0)
          ? "bold"
          : "normal",
      fontStyle: p.value === player.name ? "italic" : "normal",
      backgroundColor: p.player.color,
    };
  };

  return (
    <div className="centered">
      {drafted.length > 0 && (
        <div>
          <div className="survivor-header">Drafted</div>
          {drafted.map((p) => {
            return (
              <div className="tribe-label" key={p.value} style={getStyle(p)}>
                {p.player.draft.order}. {p.value}:{" "}
                {p.player.survivorList[0].name}
              </div>
            );
          })}
        </div>
      )}
      {upNext && (
        <div>
          <div className="survivor-header">Up Next</div>
          <div className="tribe-label" style={getStyle(upNext)}>
            {upNext.player.draft.order}. {upNext.value}
          </div>
        </div>
      )}
      {notDrafted.length > 0 && (
        <div>
          <div className="survivor-header">Not Drafted</div>
          {notDrafted.map((p) => (
            <div className="tribe-label" key={p.value} style={getStyle(p)}>
              {p.player.draft.order}. {p.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DraftOrder;
