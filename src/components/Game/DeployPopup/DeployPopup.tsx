import React from "react"

import "./DeployPopup.css"
import {Slider} from "@mui/material"

export interface DeployPopupProps {
    isVisible: boolean
    region: string
    currentTroops: number
    troopsToDeploy: number
    onSetTroops: (desiredTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
}

const DeployPopup: React.FC<DeployPopupProps> = (
    {
        isVisible,
        region,
        currentTroops,
        troopsToDeploy,
        onSetTroops,
        onCancel,
        onConfirm,
    },
) => {

    return (
        <div
            className={`risk-it-troop-deployment-popup ${isVisible ? "visible" : ""}`}>
            <h3>Deploy Troops on region {region}</h3>
            <p>Troops to Deploy: {troopsToDeploy}</p>
            <Slider
                aria-label="Desired Troops"
                key={`slider-${currentTroops}`}
                defaultValue={currentTroops}
                valueLabelDisplay="on"
                shiftStep={5}
                step={1}
                marks
                min={currentTroops}
                max={currentTroops + troopsToDeploy}
                onChange={(_, value) => onSetTroops(value as number)}
            />
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onConfirm}>Deploy</button>
        </div>
    )
}

export default DeployPopup