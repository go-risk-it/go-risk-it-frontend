import React, {useState} from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"
import RegionDisplay from "../RegionDisplay/RegionDisplay"
import Box from "@mui/material/Box"
import FlagIcon from '@mui/icons-material/Flag'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import "./Popup.css"

export interface ConquerPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    minTroopsToMove: number
    onSetTroops: (troopsToMove: number) => void
    onConfirm: () => void
    sourceOwnerIndex: number // Add this line
    targetOwnerIndex: number // Add this line
}

const ConquerPopup: React.FC<ConquerPopupProps> = (
    props,
) => {
    const [movingTroops, setMovingTroops] = useState(props.minTroopsToMove)

    const handleTroopsChange = (newValue: number) => {
        setMovingTroops(newValue)
        props.onSetTroops(newValue)
    }

    const conquer = () => {
        props.onConfirm()
        setMovingTroops(props.minTroopsToMove)
    }

    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog 
            open={true} 
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
                    <FlagIcon sx={{ color: 'var(--accent-color)' }} />
                    Conquer Territory
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
                            Source
                        </Typography>
                        <RegionDisplay
                            regionId={props.sourceRegion}
                            troops={props.troopsInSource}
                            ownerIndex={props.sourceOwnerIndex}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {props.troopsInSource} Remaining
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
                            Target
                        </Typography>
                        <RegionDisplay
                            regionId={props.targetRegion}
                            troops={movingTroops}
                            ownerIndex={props.sourceOwnerIndex}
                        />
                        <Typography variant="h6" sx={{ mt: 1, color: 'var(--accent-color)' }}>
                            {movingTroops} Moving
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
                        min={props.minTroopsToMove}
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
                <Button 
                    onClick={conquer}
                    sx={{
                        minWidth: '120px',
                        '&:not(:disabled)': {
                            background: 'linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, white)) !important'
                        }
                    }}
                >
                    Conquer
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConquerPopup
