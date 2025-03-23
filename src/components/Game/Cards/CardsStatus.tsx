import {Box} from "@mui/material"
import CardDisplay from "./CardDisplay.tsx"
import React from "react"
import {useGameState} from "../../../hooks/useGameState.ts"

const CardsStatus: React.FC = () => {
    const {cardState} = useGameState()
    return (
        <Box className="cards-grid">
            {cardState.cards.map(card => (
                <CardDisplay
                    key={card.id}
                    card={card}
                    onCardClick={null}
                    isSelected={false}
                />
            ))}
        </Box>
    )
}

export default CardsStatus