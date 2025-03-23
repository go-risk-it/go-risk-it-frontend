import { Box, Typography } from '@mui/material';
import { SportsEsports as GameIcon } from '@mui/icons-material';
import './styles/cards.css';

const EmptyGames: React.FC = () => {
    return (
        <Box className="empty-state">
            <GameIcon className="empty-state-icon" />
            <Typography variant="h6" className="empty-state-title" gutterBottom>
                No Active Games
            </Typography>
            <Typography variant="body2" className="empty-state-subtitle">
                Join a lobby to start playing!
            </Typography>
        </Box>
    );
};

export default EmptyGames; 