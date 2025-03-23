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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import "./Popup.css"

export interface AttackPopupProps {
    isVisible: boolean
    sourceRegion: string
    targetRegion: string
    troopsInSource: number
    troopsInTarget: number
    onSetTroops: (attackingTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
    sourceOwnerIndex: number
    targetOwnerIndex: number
}

const AttackPopup: React.FC<AttackPopupProps> = (
    props,
) => {
    const [attackingTroops, setAttackingTroops] = useState(1)

    const maxAttackingTroops = Math.min(props.troopsInSource - 1, 3)

    const handleTroopsChange = (newValue: number) => {
        setAttackingTroops(newValue)
        props.onSetTroops(newValue)
    }

    const attack = () => {
        props.onConfirm()
        setAttackingTroops(1)
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
            <DialogTitle>Attack</DialogTitle>
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
                            regionId={props.sourceRegion}
                            troops={props.troopsInSource}
                            ownerIndex={props.sourceOwnerIndex}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {props.troopsInSource} Troops
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
                            regionId={props.targetRegion}
                            troops={props.troopsInTarget}
                            ownerIndex={props.targetOwnerIndex}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {props.troopsInTarget} Troops
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
                        Select Attacking Troops
                    </Typography>
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
                    <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
                        {attackingTroops} {attackingTroops === 1 ? 'Troop' : 'Troops'} Attacking
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button 
                    onClick={attack}
                    disabled={maxAttackingTroops === 1}
                    sx={{
                        minWidth: '120px',
                        '&:not(:disabled)': {
                            background: 'linear-gradient(135deg, #ff4b4b, #ff6b6b) !important'
                        }
                    }}
                >
                    Attack
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AttackPopup
