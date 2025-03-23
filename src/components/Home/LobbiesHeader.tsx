import { Box, Button, Stack } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import './styles/cards.css';

interface LobbiesHeaderProps {
    onCreateLobby: () => void;
}

const LobbiesHeader: React.FC<LobbiesHeaderProps> = ({ onCreateLobby }) => {
    return (
        <Box className="section-header">
            <Stack direction="row" spacing={2} className="header-actions">
                <Button
                    onClick={onCreateLobby}
                    startIcon={<AddIcon />}
                    variant="contained"
                    className="header-button"
                >
                    Create Lobby
                </Button>
            </Stack>
        </Box>
    );
};

export default LobbiesHeader; 