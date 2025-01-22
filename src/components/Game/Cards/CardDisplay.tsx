import React from "react"
import {Card} from "../../../api/message/cardState"
import RegionDisplay from "../RegionDisplay/RegionDisplay"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import "./CardDisplay.css"

interface CardDisplayProps {
    card: Card;
    onCardClick: ((card: Card) => void) | null;
    isSelected: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({card, onCardClick, isSelected}) => {
    const isSelectable = onCardClick !== null
    const className = `risk-it-card ${
        isSelected ? "selected" : isSelectable ? "selectable" : "not-selectable"
    }`

    return (
        <Box className={className} onClick={isSelectable ? () => onCardClick(card) : undefined}>
            <div className="card-content">
                <Typography className="card-type">{card.type}</Typography>
                {card.type !== "jolly" ? (
                    <div className="card-region">
                        <RegionDisplay
                            regionId={card.region}
                            ownerIndex={-1}
                        />
                    </div>
                ) : (
                    <Typography className="jolly-text">★</Typography>
                )}
            </div>
        </Box>
    )
}

export default CardDisplay