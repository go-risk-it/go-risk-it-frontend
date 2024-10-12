import React, {useState, useEffect} from "react"
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
    onOpen: () => void;
    onClose: () => void;
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
        onOpen,
        onClose,
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

    useEffect(() => {
        if (isVisible) {
            onOpen();
        } else {
            onClose();
        }
    }, [isVisible, onOpen, onClose]);

    if (!isVisible) {
        return null
    }

    return (
        <Dialog open={isVisible} onClose={onConfirm}>
            <DialogTitle>Conquer</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay regionId={sourceRegion} svgPath={sourceSvgPath} troops={troopsInSource - troopsToMove} />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay regionId={targetRegion} svgPath={targetSvgPath} troops={troopsToMove} />
                </Box>
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirm}>Conquer</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConquerPopup
