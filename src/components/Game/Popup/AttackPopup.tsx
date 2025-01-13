import React, {useState} from "react"
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

export interface AttackPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    troopsInTarget: number
    onSetTroops: (attackingTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
    sourceOwnerIndex: number
    targetOwnerIndex: number
}

const AttackPopup: React.FC<AttackPopupProps> = (
    props,
) => {
    const [attackingTroops, setAttackingTroops] = useState(1)

    const maxAttackingTroops = Math.min(props.troopsInSource - 1, 3)

    const handleTroopsChange = (newValue: number) => {
        setAttackingTroops(newValue)
        props.onSetTroops(newValue)
    }

    return (
        <Dialog open={props.isVisible} onClose={props.onCancel} className="risk-it-move-popup">
            <DialogTitle>Attack</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay
                        regionId={props.sourceRegion}
                        troops={props.troopsInSource}
                        ownerIndex={props.sourceOwnerIndex}
                    />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay
                        regionId={props.targetRegion}
                        troops={props.troopsInTarget}
                        ownerIndex={props.targetOwnerIndex}
                    />
                </Box>
                <Slider
                    value={attackingTroops}
                    onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                    min={1}
                    max={maxAttackingTroops}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    disabled={maxAttackingTroops === 1}
                />
                <Typography gutterBottom>
                    Attacking Troops: {attackingTroops}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button onClick={props.onConfirm}>Attack</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AttackPopup
