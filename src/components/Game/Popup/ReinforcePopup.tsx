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

export interface ReinforcePopupProps {
    isVisible: boolean;
    sourceRegionId: string;
    targetRegionId: string;
    troopsInSource: number;
    troopsInTarget: number;
    movingTroops: number;
    onMovingTroopsChange: (troops: number) => void;
    onConfirm: () => void;
    onCancel: () => void;
    ownerIndex: number;
}

const ReinforcePopup: React.FC<ReinforcePopupProps> = (
    props,
) => {
    const [localMovingTroops, setLocalMovingTroops] = useState(props.movingTroops)
    const maxMovableTroops = Math.max(1, props.troopsInSource - 1)

    useEffect(() => {
        setLocalMovingTroops(props.movingTroops)
    }, [props.movingTroops])

    const handleTroopsChange = (newValue: number) => {
        const validValue = Math.max(1, Math.min(newValue, maxMovableTroops))
        setLocalMovingTroops(validValue)
        props.onMovingTroopsChange(validValue)
    }

    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog open={true} onClose={props.onCancel} className="risk-it-move-popup">
            <DialogTitle>Reinforce</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay
                        regionId={props.sourceRegionId}
                        troops={props.troopsInSource - localMovingTroops}
                        ownerIndex={props.ownerIndex}
                    />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay
                        regionId={props.targetRegionId}
                        troops={props.troopsInTarget + localMovingTroops}
                        ownerIndex={props.ownerIndex}
                    />
                </Box>
                <Slider
                    value={localMovingTroops}
                    onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                    min={1}
                    max={maxMovableTroops}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    disabled={maxMovableTroops === 1}
                />
                <Typography gutterBottom>
                    Moving Troops: {localMovingTroops}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button onClick={props.onConfirm} disabled={localMovingTroops > maxMovableTroops}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReinforcePopup