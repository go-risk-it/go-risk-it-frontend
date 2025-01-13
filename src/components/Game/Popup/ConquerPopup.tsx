import React, {useEffect, useState} from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"
import RegionDisplay from "../RegionDisplay/RegionDisplay"
import Box from "@mui/material/Box"

import "./Popup.css"

export interface ConquerPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    minTroopsToMove: number
    onSetTroops: (troopsToMove: number) => void
    onConfirm: () => void
    sourceOwnerIndex: number // Add this line
    targetOwnerIndex: number // Add this line
}

const ConquerPopup: React.FC<ConquerPopupProps> = (
    props,
) => {
    const [troopsToMove, setTroopsToMove] = useState(props.minTroopsToMove)
    const maxTroopsToMove = props.troopsInSource - 1

    useEffect(() => {
        props.onSetTroops(troopsToMove)
    }, [troopsToMove, props])

    const handleTroopsChange = (newValue: number) => {
        setTroopsToMove(newValue)
    }

    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog open={true} className="risk-it-move-popup">
            <DialogTitle>Conquer</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay
                        regionId={props.sourceRegion}
                        troops={props.troopsInSource - troopsToMove}
                        ownerIndex={props.sourceOwnerIndex}
                    />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay
                        regionId={props.targetRegion}
                        troops={troopsToMove}
                        ownerIndex={props.sourceOwnerIndex}
                    />
                </Box>
                <Slider
                    value={troopsToMove}
                    onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                    min={props.minTroopsToMove}
                    max={maxTroopsToMove}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    disabled={props.minTroopsToMove === maxTroopsToMove}
                />
                <Typography gutterBottom>
                    Troops to Move: {troopsToMove}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onConfirm}>Conquer</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConquerPopup
