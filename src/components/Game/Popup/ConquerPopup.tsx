import React, {useState, useEffect} from "react"
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import RegionDisplay from '../RegionDisplay/RegionDisplay';

import "./Popup.css"

export interface ConquerPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    minTroopsToMove: number
    onSetTroops: (troopsToMove: number) => void
    onConfirm: () => void
    sourceSvgPath: string;
    targetSvgPath: string;
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
        sourceSvgPath,
        targetSvgPath,
    },
) => {
    // Initialize troopsToMove with minTroopsToMove
    const [troopsToMove, setTroopsToMove] = useState(minTroopsToMove);
    const maxTroopsToMove = troopsInSource - 1;

    // Use useEffect to update troopsToMove when minTroopsToMove changes
    useEffect(() => {
        setTroopsToMove(minTroopsToMove);
    }, [minTroopsToMove]);

    useEffect(() => {
        onSetTroops(troopsToMove);
    }, [troopsToMove, onSetTroops]);

    const handleTroopsChange = (newValue: number) => {
        setTroopsToMove(newValue);
    };

    if (!isVisible) {
        return null
    }

    return (
        <Dialog open={isVisible} onClose={onConfirm}>
            <DialogTitle>Conquer</DialogTitle>
            <DialogContent>
                <RegionDisplay regionId={sourceRegion} svgPath={sourceSvgPath} />
                <Typography>(Troops: {troopsInSource})</Typography>
                <RegionDisplay regionId={targetRegion} svgPath={targetSvgPath} />
                <Slider
                    value={troopsToMove}
                    onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                    min={minTroopsToMove}
                    max={maxTroopsToMove}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    disabled={minTroopsToMove === maxTroopsToMove}
                />
                <Typography gutterBottom>
                    Troops to Move: {troopsToMove}
                </Typography>
                <Typography>
                    New troops in <RegionDisplay regionId={sourceRegion} svgPath={sourceSvgPath} />: {troopsInSource - troopsToMove}
                </Typography>
                <Typography>
                    New troops in <RegionDisplay regionId={targetRegion} svgPath={targetSvgPath} />: {troopsToMove}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirm}>Conquer</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConquerPopup
