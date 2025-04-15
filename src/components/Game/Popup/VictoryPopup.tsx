import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"

import "./Popup.css"
import {PlayerState} from "../../../api/game/message/playersState.ts"

export interface VictoryPopupProps {
    thisPlayer: PlayerState
    winner: PlayerState
    onClose: () => void
}

const VictoryPopup: React.FC<VictoryPopupProps> = (
    props,
) => {
    const isCurrentUserWinner = props.winner.userId === props.thisPlayer.userId

    return (
        <Dialog
            open={true}
            className="risk-it-move-popup"
            maxWidth={false}
            fullWidth={false}
            onClose={props.onClose}
            PaperProps={{
                sx: {
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                },
            }}
        >
            <DialogTitle sx={{ position: "relative" }}>
                {isCurrentUserWinner ? "Congratulations!" : "Game Over"}
                <IconButton
                    aria-label="close"
                    onClick={props.onClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                            color: 'rgba(255, 255, 255, 0.9)',
                            background: 'rgba(255, 255, 255, 0.1)'
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "16px",
                        padding: "1.5rem",
                        textAlign: "center",
                        marginBottom: "1rem",
                        transition: "all 0.3s ease-out",
                        '&:hover': {
                            background: "rgba(255, 255, 255, 0.05)",
                            transform: "scale(1.02)"
                        }
                    }}
                >
                    <Typography variant="h6" sx={{opacity: 0.9, mb: 1}}>
                        {isCurrentUserWinner
                            ? "You are the winner! 🎉"
                            : `The winner is ${props.winner.name} 💀`}
                    </Typography>
                    {isCurrentUserWinner && (
                        <Typography variant="body1" sx={{opacity: 0.7}}>
                            Great job! You outplayed everyone and claimed victory.
                        </Typography>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default VictoryPopup