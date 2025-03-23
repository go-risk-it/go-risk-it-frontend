import React, {useEffect, useState} from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"
import RegionDisplay from "../RegionDisplay/RegionDisplay"
import Box from "@mui/material/Box"
import AddCircleIcon from '@mui/icons-material/AddCircle'

import "./Popup.css"

export interface DeployPopupProps {
    isVisible: boolean
    region: string
    currentTroops: number
    deployableTroops: number
    onSetTroops: (desiredTroops: number) => void
    onCancel: () => void
    onConfirm: () => void
    ownerIndex: number
}

const DeployPopup: React.FC<DeployPopupProps> = (
    props,
) => {
    const [desiredTroops, setDesiredTroops] = useState(props.currentTroops)

    useEffect(() => {
        setDesiredTroops(props.currentTroops)
    }, [props.currentTroops])

    const handleTroopsChange = (newValue: number) => {
        setDesiredTroops(newValue)
        props.onSetTroops(newValue)
    }

    if (!props.isVisible) {
        return null
    }

    const troopsToAdd = desiredTroops - props.currentTroops

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
            <DialogTitle>Deploy Troops</DialogTitle>
            <DialogContent>
                <Box 
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        transition: 'all 0.3s ease-out',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            transform: 'scale(1.02)'
                        }
                    }}
                >
                    <Typography variant="subtitle1" sx={{ opacity: 0.7, mb: 1 }}>
                        Selected Region
                    </Typography>
                    <RegionDisplay
                        regionId={props.region}
                        troops={props.currentTroops}
                        ownerIndex={props.ownerIndex}
                    />
                    <Box 
                        sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mt: 2
                        }}
                    >
                        <Typography variant="h6">
                            {props.currentTroops} Troops
                        </Typography>
                        <AddCircleIcon 
                            sx={{ 
                                color: 'var(--accent-color)',
                                filter: 'drop-shadow(0 0 8px rgba(var(--accent-color-rgb), 0.3))'
                            }} 
                        />
                        <Typography variant="h6" sx={{ color: 'var(--accent-color)' }}>
                            {troopsToAdd} New
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
                        Deploy {props.deployableTroops} Available Troops
                    </Typography>
                    <Slider
                        value={desiredTroops}
                        onChange={(_, newValue) => handleTroopsChange(newValue as number)}
                        min={props.currentTroops}
                        max={props.currentTroops + props.deployableTroops}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                    />
                    <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
                        Total After Deployment: {desiredTroops} Troops
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button 
                    onClick={props.onConfirm}
                    sx={{
                        minWidth: '120px',
                        '&:not(:disabled)': {
                            background: 'linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, white)) !important'
                        }
                    }}
                >
                    Deploy
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeployPopup
