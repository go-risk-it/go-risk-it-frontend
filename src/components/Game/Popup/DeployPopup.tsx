import React from "react"
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import "./Popup.css"

export interface DeployPopupProps {
    isVisible: boolean
    region: string
    currentTroops: number
    deployableTroops: number
    onSetTroops: (desiredTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
}

const DeployPopup: React.FC<DeployPopupProps> = (
    {
        isVisible,
        region,
        currentTroops,
        deployableTroops,
        onSetTroops,
        onCancel,
        onConfirm,
    },
) => {
    const [desiredTroops, setDesiredTroops] = React.useState(currentTroops);

    const handleTroopsChange = (newValue: number) => {
        setDesiredTroops(newValue);
        onSetTroops(newValue);
    };

    return (
        <Dialog open={isVisible} onClose={onCancel}>
            <DialogTitle>Deploy Troops</DialogTitle>
            <DialogContent>
                <Typography>Region: {region}</Typography>
                <Typography>Current Troops: {currentTroops}</Typography>
                <Typography>Troops to Deploy: {deployableTroops}</Typography>
                <Slider
                    value={desiredTroops}
                    onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                    min={currentTroops}
                    max={currentTroops + deployableTroops}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                />
                <Typography gutterBottom>
                    Total Troops After Deployment: {desiredTroops}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm}>Deploy</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeployPopup
