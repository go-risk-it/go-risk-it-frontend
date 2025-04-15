import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"

import "./Popup.css"

export interface AdvancePopupProps {
    isVisible: boolean
    onConfirm: () => void
    onCancel: () => void
}

const AdvancePopup: React.FC<AdvancePopupProps> = (props) => {
    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog
            open={true}
            className="risk-it-move-popup"
            maxWidth={false}
            fullWidth={false}
            onClose={props.onCancel}
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }
            }}
        >
            <DialogContent>
                <Box >
                    <Typography variant="h6">
                        Are you sure you want to advance?
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={props.onCancel}
                >
                    Cancel
                </Button>
                <Button
                    onClick={props.onConfirm}
                    variant="contained"
                >
                    Advance
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AdvancePopup 