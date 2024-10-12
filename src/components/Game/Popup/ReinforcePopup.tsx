import React from 'react';
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
}) => {
    const maxMovableTroops = Math.max(1, troopsInSource - 1);
    
    React.useEffect(() => {
        if (movingTroops < 1) {
            onMovingTroopsChange(1);
        }
    }, [movingTroops, onMovingTroopsChange]);

    return (
        <Dialog open={isOpen} onClose={onCancel}>
            <DialogTitle>Reinforce</DialogTitle>
            <DialogContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <RegionDisplay regionId={sourceRegionId} svgPath={sourceRegionSvgPath} troops={troopsInSource - movingTroops} />
                    <Typography variant="h6" alignSelf="center">→</Typography>
                    <RegionDisplay regionId={targetRegionId} svgPath={targetRegionSvgPath} troops={troopsInTarget + movingTroops} />
                </Box>
                <Slider
                    value={movingTroops}
                    onChange={(_, newValue) => onMovingTroopsChange(Math.max(1, newValue as number))}
                    min={1}
                    max={maxMovableTroops}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                />
                <Typography gutterBottom>
                    Moving Troops: {movingTroops}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} disabled={movingTroops > maxMovableTroops}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReinforcePopup;
