import React, {useEffect, useState} from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"
import RegionDisplay from "../RegionDisplay/RegionDisplay"

import "./Popup.css"

export interface DeployPopupProps {
    isVisible: boolean
    region: string
    currentTroops: number
    deployableTroops: number
    onSetTroops: (desiredTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
    ownerIndex: number
}

const DeployPopup: React.FC<DeployPopupProps> = (
    props,
) => {
    const [desiredTroops, setDesiredTroops] = useState(props.currentTroops)

    useEffect(() => {
        setDesiredTroops(props.currentTroops)
    }, [props.currentTroops])

    const handleTroopsChange = (newValue: number) => {
        setDesiredTroops(newValue)
        props.onSetTroops(newValue)
    }

    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog open={true} onClose={props.onCancel} className="risk-it-move-popup">
            <DialogTitle>Deploy Troops</DialogTitle>
            <DialogContent>
                <RegionDisplay
                    regionId={props.region}
                    troops={props.currentTroops}
                    ownerIndex={props.ownerIndex}
                />
                <Typography>Current Troops: {props.currentTroops}</Typography>
                <Typography>Troops to Deploy: {props.deployableTroops}</Typography>
                <Slider
                    value={desiredTroops}
                    onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                    min={props.currentTroops}
                    max={props.currentTroops + props.deployableTroops}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                />
                <Typography gutterBottom>
                    Total Troops After Deployment: {desiredTroops}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button onClick={props.onConfirm}>Deploy</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeployPopup
