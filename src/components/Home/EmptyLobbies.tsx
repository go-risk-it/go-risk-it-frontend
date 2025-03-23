import { Box, Typography } from '@mui/material';
import { Groups as LobbyIcon } from '@mui/icons-material';
import './styles/cards.css';

const EmptyLobbies: React.FC = () => {
    return (
        <Box className="empty-state">
            <LobbyIcon className="empty-state-icon" />
            <Typography variant="h6" className="empty-state-title" gutterBottom>
                No Available Lobbies
            </Typography>
            <Typography variant="body2" className="empty-state-subtitle">
                Create a new lobby to start playing!
            </Typography>
        </Box>
    );
};

export default EmptyLobbies; 