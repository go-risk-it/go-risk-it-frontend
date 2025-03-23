import React from "react"
import {Card} from "../../../api/game/message/cardState"
import RegionDisplay from "../RegionDisplay/RegionDisplay"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import "./CardDisplay.css"

interface CardDisplayProps {
    card: Card;
    onCardClick: ((card: Card) => void) | null;
    isSelected: boolean;
}

const formatRegionName = (name: string) => {
    return name.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const CardDisplay: React.FC<CardDisplayProps> = ({card, onCardClick, isSelected}) => {
    const isSelectable = onCardClick !== null
    const className = `risk-it-card ${
        isSelected ? "selected" : isSelectable ? "selectable" : "not-selectable"
    }`

    return (
        <Box 
            className={className} 
            onClick={isSelectable ? () => onCardClick(card) : undefined}
            role={isSelectable ? "button" : undefined}
            aria-pressed={isSelected}
        >
            <Typography className="card-type">
                {card.type}
            </Typography>
            <div className="card-content">
                {card.type !== "jolly" ? (
                    <div className="card-region">
                        <RegionDisplay
                            regionId={card.region}
                            ownerIndex={-1}
                        />
                        <div className="region-name">
                            {formatRegionName(card.region)}
                        </div>
                    </div>
                ) : (
                    <Typography className="jolly-text">★</Typography>
                )}
            </div>
        </Box>
    )
}

export default CardDisplay