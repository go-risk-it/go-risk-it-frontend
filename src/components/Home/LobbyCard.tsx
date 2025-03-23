import { Card, CardContent, Typography, Button, Box, CardActions } from "@mui/material"
import { Groups as LobbyIcon } from "@mui/icons-material"
import './styles/cards.css'
import { Lobby } from '../../api/lobby/lobbiesList'

interface LobbyCardProps {
    lobby: Lobby
    joinLobby?: (lobbyId: number) => void
    startGame?: (lobbyId: number) => void
}

export const LobbyCard: React.FC<LobbyCardProps> = ({ lobby, joinLobby, startGame }) => {
    return (
        <Card className="lobby-pod">
            <CardContent className="lobby-pod-content">
                <Box className="lobby-pod-header">
                    <LobbyIcon className="lobby-pod-icon" />
                    <Typography variant="h6" component="div" className="lobby-pod-title">
                        {lobby.id}
                    </Typography>
                </Box>
                <Typography variant="body2" className="lobby-pod-subtitle">
                    Players: {lobby.numberOfParticipants}
                </Typography>
            </CardContent>
            <CardActions className="lobby-pod-actions">
                {joinLobby && (
                    <Button
                        variant="contained"
                        onClick={() => joinLobby(lobby.id)}
                        className="lobby-pod-button"
                    >
                        Join Lobby
                    </Button>
                )}
                {startGame && (
                    <Button
                        variant="contained"
                        onClick={() => startGame(lobby.id)}
                        className="lobby-pod-button"
                    >
                        Start Game
                    </Button>
                )}
            </CardActions>
        </Card>
    )
} 