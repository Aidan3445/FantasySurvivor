import React from "react";
import PropTypes from "prop-types";

function DraftOrder(props) {
  var { player, draftOrder } = props;

  DraftOrder.propTypes = {
    player: PropTypes.object.isRequired,
    draftOrder: PropTypes.array.isRequired,
  };

  var drafted = [];
  var notDrafted = [];
  draftOrder.forEach((p) => {
    if (p.player.survivorList.length === 0) {
      notDrafted.push(p);
    } else {
      drafted.push(p);
    }
  });

  const getStyle = (p) => {
    return {
      fontWeight:
        p.player.draft.order <=
        draftOrder.findIndex((p2) => p2.player.survivorList.length === 0)
          ? "700"
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
              <div
                className="color-label inline-div"
                key={p.value}
                style={getStyle(p)}
              >
                {p.player.draft.order}. {p.value}:
                <div className="sub-label">{p.player.survivorList[0].name}</div>
              </div>
            );
          })}
        </div>
      )}
      {notDrafted.length > 0 && (
        <div>
          <div className="survivor-header">Up Next</div>
          {notDrafted.map((p) => (
            <div className="color-label" key={p.value} style={getStyle(p)}>
              {p.player.draft.order}. {p.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DraftOrder;
