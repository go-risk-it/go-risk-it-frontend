import React, { useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"
import RegionDisplay from "../RegionDisplay/RegionDisplay"
import Box from "@mui/material/Box"
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import "./Popup.css"

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
    const [movingTroops, setMovingTroops] = useState(0)

    const handleTroopsChange = (newValue: number) => {
        setMovingTroops(newValue)
        props.onMovingTroopsChange(newValue)
    }

    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog
            open={true}
            onClose={props.onCancel}
            className="risk-it-move-popup"
            maxWidth={false}
            fullWidth={false}
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompareArrowsIcon sx={{ color: 'var(--accent-color)' }} />
                    Reinforce Territory
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        transition: 'all 0.3s ease-out',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            transform: 'scale(1.02)'
                        }
                    }}
                >
                    <Box textAlign="center">
                        <Typography variant="subtitle1" sx={{ opacity: 0.7, mb: 1 }}>
                            From
                        </Typography>
                        <RegionDisplay
                            regionId={props.sourceRegionId}
                            troops={props.troopsInSource - movingTroops}
                            ownerIndex={props.ownerIndex}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {props.troopsInSource - movingTroops} Remaining
                        </Typography>
                    </Box>
                    <ArrowForwardIcon
                        sx={{
                            fontSize: '2rem',
                            color: 'var(--accent-color)',
                            filter: 'drop-shadow(0 0 8px rgba(var(--accent-color-rgb), 0.3))'
                        }}
                    />
                    <Box textAlign="center">
                        <Typography variant="subtitle1" sx={{ opacity: 0.7, mb: 1 }}>
                            To
                        </Typography>
                        <RegionDisplay
                            regionId={props.targetRegionId}
                            troops={props.troopsInTarget + movingTroops}
                            ownerIndex={props.ownerIndex}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {props.troopsInTarget + movingTroops} After Move
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        transition: 'all 0.3s ease-out',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)'
                        }
                    }}
                >
                    <Typography variant="subtitle1" sx={{ mb: 2, opacity: 0.7 }}>
                        Select Troops to Move
                    </Typography>
                    <Slider
                        value={movingTroops}
                        onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                        min={1}
                        max={props.troopsInSource - 1}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                    />
                    <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
                        Moving {movingTroops} {movingTroops === 1 ? 'Troop' : 'Troops'}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button
                    onClick={props.onConfirm}
                    disabled={movingTroops === 0}
                    sx={{
                        minWidth: '120px',
                        '&:not(:disabled)': {
                            background: 'linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, white)) !important'
                        }
                    }}
                >
                    Move Troops
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReinforcePopup