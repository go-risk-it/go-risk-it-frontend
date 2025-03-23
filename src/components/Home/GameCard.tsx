import { Card, CardContent, CardActions, Button, Typography, Box } from '@mui/material';
import { SportsEsports as GameIcon } from '@mui/icons-material';
import { Game } from '../../api/game/message/gamesList';
import './styles/cards.css';

interface GameCardProps {
    game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
    const handleJoinGame = () => {
        window.location.href = `/games/${game.id}`;
    };

    return (
        <Card className="lobby-pod">
            <CardContent className="lobby-pod-content">
                <Box className="lobby-pod-header">
                    <GameIcon className="lobby-pod-icon" />
                    <Typography variant="h6" component="div" className="lobby-pod-title">
                        Game {game.id}
                    </Typography>
                </Box>
            </CardContent>
            <CardActions className="lobby-pod-actions">
                <Button 
                    variant="contained" 
                    onClick={handleJoinGame}
                    className="lobby-pod-button"
                >
                    Join Game
                </Button>
            </CardActions>
        </Card>
    );
};

export default GameCard; 