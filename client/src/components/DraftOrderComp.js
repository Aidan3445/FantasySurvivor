import React from "react";
import PropTypes from "prop-types";
import { isLightColor } from "../utils/miscUtils";

function DraftOrder(props) {
    var { player, draftOrder, nextPick } = props;

    DraftOrder.propTypes = {
        player: PropTypes.object,
        draftOrder: PropTypes.array.isRequired,
        nextPick: PropTypes.number.isRequired,
    };

    if (!player) return null;

    const getLabels = (draftOrder, undrafted = true) => {
        const drafted = draftOrder
            .map((p) => (
                <div
                    className="color-label inline-div"
                    key={p.name}
                    style={{
                        backgroundColor: p.color,
                        color: isLightColor(p.color) ? "black" : "white",
                        fontWeight: undrafted ? "normal" : 700,
                        fontStyle: p.name === player.name ? "italic" : "normal"
                    }}
                >
                    {p.draft.order}. {p.name}
                    {p.draft.survivor && <div className="sub-label">Picked {p.draft.survivor}</div>}
                </div>
            ));
        if (drafted.length > 0) return (
            <div>
                <div className="survivor-header">
                    {undrafted ? "Up Next" : "Drafted"}
                </div>
                {drafted}
            </div>
        );
    }


    return (
        <div className="centered">
            {getLabels(draftOrder.filter((p) => p.draft.order < nextPick), false)}
            {getLabels(draftOrder.filter((p) => p.draft.order >= nextPick))}
        </div>
    );
}

export default DraftOrder;
