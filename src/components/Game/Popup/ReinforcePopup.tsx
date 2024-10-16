import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import RegionDisplay from '../RegionDisplay/RegionDisplay';
import Box from '@mui/material/Box';
import { PopupProps } from "./PopupProps";

interface ReinforcePopupProps {
    isOpen: boolean;
    sourceRegionId: string;
    targetRegionId: string;
    troopsInSource: number;
    troopsInTarget: number;
    movingTroops: number;
    onMovingTroopsChange: (troops: number) => void;
    onConfirm: () => void;
    onCancel: () => void;
    sourceRegionSvgPath: string;
    targetRegionSvgPath: string;
    ownerIndex: number;
}

const ReinforcePopup: React.FC<PopupProps<ReinforcePopupProps>> = (
    {
        props,
        onOpen,
        onClose,
    },
) => {
    const [localMovingTroops, setLocalMovingTroops] = useState(props.movingTroops);
    const maxMovableTroops = Math.max(1, props.troopsInSource - 1);
    
    useEffect(() => {
        if (props.isOpen) {
            onOpen();
        } else {
            onClose();
        }
    }, [props.isOpen, onOpen, onClose]);

    useEffect(() => {
        setLocalMovingTroops(props.movingTroops);
    }, [props.movingTroops]);

    const handleTroopsChange = (newValue: number) => {
        const validValue = Math.max(1, Math.min(newValue, maxMovableTroops));
        setLocalMovingTroops(validValue);
        props.onMovingTroopsChange(validValue);
    };

    if (!props.isOpen) return null;

    return (
        <Dialog open={props.isOpen} onClose={props.onCancel}>
            <DialogTitle>Reinforce</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay 
                        regionId={props.sourceRegionId} 
                        svgPath={props.sourceRegionSvgPath} 
                        troops={props.troopsInSource - localMovingTroops} 
                        ownerIndex={props.ownerIndex} // Add this line
                    />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay 
                        regionId={props.targetRegionId} 
                        svgPath={props.targetRegionSvgPath} 
                        troops={props.troopsInTarget + localMovingTroops} 
                        ownerIndex={props.ownerIndex} // Add this line
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
    );
};

export default ReinforcePopup;