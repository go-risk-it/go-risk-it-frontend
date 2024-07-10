import React from "react"

import "./DeployPopup.css"
import {Slider} from "@mui/material"

export interface DeployPopupProps {
    isVisible: boolean
    region: string
    currentTroops: number
    deployableTroops: number
    onSetTroops: (desiredTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
}

const DeployPopup: React.FC<DeployPopupProps> = (
    {
        isVisible,
        region,
        currentTroops,
        deployableTroops,
        onSetTroops,
        onCancel,
        onConfirm,
    },
) => {

    if (!isVisible) {
        return null
    }

    return (
        <div
            className="risk-it-troop-deployment-popup">
            <h3>Deploy Troops on region {region}</h3>
            <p>Troops to Deploy: {deployableTroops}</p>
            <Slider
                aria-label="Desired Troops"
                key={`slider-${currentTroops}`}
                defaultValue={currentTroops}
                valueLabelDisplay="on"
                shiftStep={5}
                step={1}
                marks
                min={currentTroops}
                max={currentTroops + deployableTroops}
                onChange={(_, value) => onSetTroops(value as number)}
            />
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onConfirm}>Deploy</button>
        </div>
    )
}

export default DeployPopup