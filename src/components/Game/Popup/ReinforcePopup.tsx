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
    onOpen: () => void;
    onClose: () => void;
}

const ReinforcePopup: React.FC<ReinforcePopupProps> = ({
    isOpen,
    sourceRegionId,
    targetRegionId,
    troopsInSource,
    troopsInTarget,
    movingTroops,
    onMovingTroopsChange,
    onConfirm,
    onCancel,
    sourceRegionSvgPath,
    targetRegionSvgPath,
    onOpen,
    onClose,
}) => {
    const [localMovingTroops, setLocalMovingTroops] = useState(movingTroops);
    const maxMovableTroops = Math.max(1, troopsInSource - 1);
    
    useEffect(() => {
        if (isOpen) {
            onOpen();
        } else {
            onClose();
        }
    }, [isOpen, onOpen, onClose]);

    useEffect(() => {
        setLocalMovingTroops(movingTroops);
    }, [movingTroops]);

    const handleTroopsChange = (newValue: number) => {
        const validValue = Math.max(1, Math.min(newValue, maxMovableTroops));
        setLocalMovingTroops(validValue);
        onMovingTroopsChange(validValue);
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={onCancel}>
            <DialogTitle>Reinforce</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay regionId={sourceRegionId} svgPath={sourceRegionSvgPath} troops={troopsInSource - localMovingTroops} />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay regionId={targetRegionId} svgPath={targetRegionSvgPath} troops={troopsInTarget + localMovingTroops} />
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
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} disabled={localMovingTroops > maxMovableTroops}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReinforcePopup;
