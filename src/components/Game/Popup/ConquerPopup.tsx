import React, {useState} from "react"

import "./Popup.css"
import {Slider} from "@mui/material"

export interface ConquerPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    minTroopsToMove: number
    onSetTroops: (troopsToMove: number) => void
    onConfirm: () => void
}

const ConquerPopup: React.FC<ConquerPopupProps> = (
    {
        isVisible,
        sourceRegion,
        targetRegion,
        troopsInSource,
        minTroopsToMove,
        onSetTroops,
        onConfirm,
    },
) => {
    const [newTroopsInSource, setNewTroopsInSource] = useState(troopsInSource - minTroopsToMove)
    const [newTroopsInTarget, setNewTroopsInTarget] = useState(minTroopsToMove)
    if (!isVisible) {
        console.log("ConquerPopup not visible")
        return null
    }
    console.log("ConquerPopup visible")

    const maxTroopsToMove = troopsInSource - 1

    return (
        <div
            className="risk-it-move-popup">
            <h3>Conquer from {sourceRegion} to {targetRegion}</h3>
            <p>Select number of troops to move</p>
            <Slider
                aria-label="Desired Troops"
                key={`slider-conquer-${troopsInSource}`}
                defaultValue={1}
                valueLabelDisplay="on"
                shiftStep={5}
                step={1}
                marks
                min={minTroopsToMove}
                max={maxTroopsToMove}
                onChange={(_, value) => {
                    onSetTroops(value as number)
                    setNewTroopsInSource(troopsInSource - (value as number))
                    setNewTroopsInTarget(value as number)
                }
                }
            />
            <h4>New troops in source region: {newTroopsInSource}</h4>
            <h4>New troops in target region: {newTroopsInTarget}</h4>
            <button onClick={onConfirm}>Conquer</button>
        </div>

    )
}

export default ConquerPopup