import React from 'react';
import { Box, Typography } from '@mui/material';
import RegionDisplay from '../RegionDisplay/RegionDisplay';
import { CardType } from '../../../api/message/cardState';

interface CardProps {
  card: CardType;
  getSvgPathForRegion: (regionId: string) => string;
}

const Card: React.FC<CardProps> = ({ card, getSvgPathForRegion }) => {
  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '8px',
        width: '120px',
        height: '180px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="h6">{card.type}</Typography>
      {card.type !== 'jolly' && card.regionId && (
        <RegionDisplay
          regionId={card.regionId}
          svgPath={getSvgPathForRegion(card.regionId)}
          troops={0}
          ownerIndex={-1}
          width={80}
          height={80}
        />
      )}
      {card.type === 'jolly' && (
        <Box
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: '50%',
          }}
        >
          <Typography variant="h4">★</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Card;
