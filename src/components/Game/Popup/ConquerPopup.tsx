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
import { PopupProps } from "./PopupProps";

export interface ConquerPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    minTroopsToMove: number
    onSetTroops: (troopsToMove: number) => void
    onConfirm: () => void
    sourceSvgPath: string
    targetSvgPath: string
}

const ConquerPopup: React.FC<PopupProps<ConquerPopupProps>> = (
    {
        props,
        onOpen,
        onClose,
    },
) => {
    const [troopsToMove, setTroopsToMove] = useState(props.minTroopsToMove);
    const maxTroopsToMove = props.troopsInSource - 1;

    useEffect(() => {
        setTroopsToMove(props.minTroopsToMove);
    }, [props.minTroopsToMove]);

    useEffect(() => {
        props.onSetTroops(troopsToMove);
    }, [troopsToMove, props.onSetTroops]);

    const handleTroopsChange = (newValue: number) => {
        setTroopsToMove(newValue);
    };

    useEffect(() => {
        if (props.isVisible) {
            onOpen();
        } else {
            onClose();
        }
    }, [props.isVisible, onOpen, onClose]);

    if (!props.isVisible) {
        return null;
    }

    return (
        <Dialog open={props.isVisible} onClose={props.onConfirm}>
            <DialogTitle>Conquer</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay regionId={props.sourceRegion} svgPath={props.sourceSvgPath} troops={props.troopsInSource - troopsToMove} />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay regionId={props.targetRegion} svgPath={props.targetSvgPath} troops={troopsToMove} />
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
    );
}

export default ConquerPopup
