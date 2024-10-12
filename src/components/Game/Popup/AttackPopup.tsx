import React from "react"
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import RegionDisplay from '../RegionDisplay/RegionDisplay';
import Box from '@mui/material/Box';

import "./Popup.css"

export interface AttackPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    troopsInTarget: number
    sourceSvgPath: string
    targetSvgPath: string
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
        troopsInTarget,
        sourceSvgPath,
        targetSvgPath,
        onSetTroops,
        onCancel,
        onConfirm,
    },
) => {
    if (!isVisible) {
        return null
    }

    const maxAttackingTroops = Math.min(troopsInSource - 1, 3)

    const [attackingTroops, setAttackingTroops] = React.useState(1);

    const handleTroopsChange = (newValue: number) => {
        setAttackingTroops(newValue);
        onSetTroops(newValue);
    };

    return (
        <Dialog open={isVisible} onClose={onCancel}>
            <DialogTitle>Attack</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay regionId={sourceRegion} svgPath={sourceSvgPath} troops={troopsInSource} />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay regionId={targetRegion} svgPath={targetSvgPath} troops={troopsInTarget} />
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
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm}>Attack</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AttackPopup
