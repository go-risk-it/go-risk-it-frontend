import React, {useEffect, useState} from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import {Box, IconButton} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

import "./Popup.css"
import {PopupProps} from "./PopupProps"
import {Card} from "../../../api/message/cardState.ts"
import CardDisplay from "../Cards/CardDisplay.tsx"
import {CardCombination} from "../../../api/message/cardMove.ts"
import Typography from "@mui/material/Typography"

export interface CardsPopupProps {
    isVisible: boolean
    playerCards: Card[]
    onCombinationAdd: (combination: number[]) => void
    onCombinationRemove: (index: number) => void
    selectedCombinations: CardCombination[]
    onCancel: () => void
    onConfirm: () => void
}

const CardsPopup: React.FC<PopupProps<CardsPopupProps>> = (
    {
        props,
        onOpen,
        onClose,
    },
) => {
    const [selectedCards, setSelectedCards] = useState<number[]>([])

    useEffect(() => {
        if (props.isVisible) {
            onOpen()
        } else {
            onClose()
        }
    }, [props.isVisible, onOpen, onClose])

    const handleCardClick = (card: Card) => {
        let newSelectedCards: number[]
        if (selectedCards.includes(card.id)) {
            newSelectedCards = selectedCards.filter(id => id !== card.id)
        } else {
            newSelectedCards = [...selectedCards, card.id]
            if (newSelectedCards.length === 3) {
                console.log("Forming combination: ", newSelectedCards)
                props.onCombinationAdd(newSelectedCards)
                newSelectedCards = []
            }
        }
        setSelectedCards(newSelectedCards)
    }

    const handleCombinationRemove = (index: number) => {
        props.onCombinationRemove(index)
    }

    const availableCards = props.playerCards.filter(card => !props.selectedCombinations.some(combination => combination.cardIDs.includes(card.id)))

    return (
        <Dialog open={props.isVisible} onClose={props.onCancel}>
            <DialogTitle>Play your cards</DialogTitle>
            <DialogContent className="cards-container">
                <Box display="flex" flexDirection="column">
                    <Typography variant="h6" align="center" gutterBottom>
                        Your Cards
                    </Typography>

                    <Box display="flex" flexWrap="wrap" justifyContent="center">
                        {availableCards.length > 0 ? (
                            availableCards.map(card => (
                                <CardDisplay
                                    key={card.id}
                                    card={card}
                                    onCardClick={handleCardClick}
                                    isSelected={selectedCards.includes(card.id)}
                                />
                            ))
                        ) : (
                            <Typography variant="body1" color="textSecondary" align="center">
                                No more cards to play.
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="h6" align="center" gutterBottom mt={4}>
                        Combinations to Play
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                        {props.selectedCombinations.length > 0 ? (
                            props.selectedCombinations.map((combination, index) => (
                                <Box key={index} display="flex" alignItems="center">
                                    {/* Row: Cards in the Combination */}
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                        {combination.cardIDs.map(cardId => {
                                            const card = props.playerCards.find(c => c.id === cardId)
                                            return card ? (
                                                <CardDisplay
                                                    key={card.id}
                                                    card={card}
                                                    onCardClick={null}
                                                    isSelected={false}
                                                />
                                            ) : null
                                        })}
                                    </Box>
                                    {/* Remove Combination Button */}
                                    <IconButton onClick={() => handleCombinationRemove(index)}>
                                        <CloseIcon/>
                                    </IconButton>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body1" color="textSecondary" align="center">
                                Choose a combination to play your cards.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={props.onConfirm} disabled={props.selectedCombinations.length === 0}>Play cards</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CardsPopup