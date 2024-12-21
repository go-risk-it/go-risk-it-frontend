import React from "react"
import {Card} from "../../../api/message/cardState"
import RegionDisplay from "../RegionDisplay/RegionDisplay"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import "./CardDisplay.css"

interface CardDisplayProps {
    card: Card;
    onCardClick: ((card: Card) => void) | null; // if not null or undefined, the card is selectable
    isSelected: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({card, onCardClick, isSelected}) => {
    const isSelectable = onCardClick !== null
    return (
        <Box display="flex" flexDirection="column" alignItems="center" border={1} borderRadius={2} p={1} m={1}
             onClick={isSelectable ? () => onCardClick(card) : undefined}
             className={`${isSelected ? "risk-it-card-selected" : isSelectable ? "risk-it-card-selectable" : "risk-it-card-not-selectable"}`}>

            <Typography variant="h6">{card.type}</Typography>
            {card.type !== "jolly" && (
                <RegionDisplay
                    regionId={card.region}
                    ownerIndex={-1} // We don't need to show ownership for cards
                />
            )}
            {card.type === "jolly" && (
                <Typography variant="body1">Jolly Card</Typography>
            )}
        </Box>
    )
}

export default CardDisplay
