import React from 'react';
import { Card } from '../../../api/message/cardState';
import RegionDisplay from '../RegionDisplay/RegionDisplay';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CardDisplayProps {
    card: Card;
    getSvgPathForRegion: (regionId: string) => string;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, getSvgPathForRegion }) => {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" border={1} borderRadius={2} p={1} m={1}>
            <Typography variant="h6">{card.type}</Typography>
            {card.type !== 'jolly' && (
                <RegionDisplay
                    regionId={card.region}
                    svgPath={getSvgPathForRegion(card.region)}
                    ownerIndex={-1} // We don't need to show ownership for cards
                />
            )}
            {card.type === 'jolly' && (
                <Typography variant="body1">Jolly Card</Typography>
            )}
        </Box>
    );
};

export default CardDisplay;
