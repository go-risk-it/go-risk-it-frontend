import React from "react"

import "./Popup.css"
import {Slider} from "@mui/material"

export interface AttackPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    onSetTroops: (attackingTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
}

const AttackPopup: React.FC<AttackPopupProps> = (
    {
        isVisible,
        sourceRegion,
        targetRegion,
        troopsInSource,
        onSetTroops,
        onCancel,
        onConfirm,
    },
) => {
    if (!isVisible) {
        console.log("AttackPopup not visible")
        return null
    }
    console.log("AttackPopup visible")

    const maxAttackingTroops = Math.min(troopsInSource - 1, 3)

    return (
        <div
            className="risk-it-move-popup">
            <h3>Attack from {sourceRegion} to {targetRegion}</h3>
            <p>Select number of attacking troops</p>
            <Slider
                aria-label="Desired Troops"
                key={`slider-attacking-${troopsInSource}`}
                defaultValue={1}
                valueLabelDisplay="on"
                shiftStep={5}
                step={1}
                marks
                min={1}
                max={maxAttackingTroops}
                onChange={(_, value) => onSetTroops(value as number)}
            />
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onConfirm}>Attack</button>
        </div>

    )
}

export default AttackPopup