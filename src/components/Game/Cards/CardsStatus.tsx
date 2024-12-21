import {Box, Typography} from "@mui/material"
import CardDisplay from "./CardDisplay.tsx"
import React from "react"
import {useGameState} from "../../../hooks/useGameState.ts"


const CardsStatus: React.FC = () => {
    const {cardState} = useGameState()
    return (
        <Box display="flex" flexWrap="wrap" justifyContent="center" mt={2}>
            <Typography variant="h6">Your Cards:</Typography>
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