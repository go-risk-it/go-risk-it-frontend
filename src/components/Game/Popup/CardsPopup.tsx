import React, {useState} from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import {Box, IconButton} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

import "./Popup.css"
import {Card} from "../../../api/message/cardState.ts"
import CardDisplay from "../Cards/CardDisplay.tsx"
import {CardCombination} from "../../../api/message/cardMove.ts"
import Typography from "@mui/material/Typography"

export interface CardsPopupProps {
    isVisible: boolean
    playerCards: Card[]
    onCombinationAdd: (combination: number[]) => void
    onCombinationRemove: (index: number) => void
    isCardSelectable: (selectedCards: number[], card: Card) => boolean
    selectedCombinations: CardCombination[]
    onCancel: () => void
    onConfirm: () => void
}

const CardsPopup: React.FC<CardsPopupProps> = (
    props,
) => {

    const [selectedCards, setSelectedCards] = useState<number[]>([])


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

    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog
            open={true}
            onClose={props.onCancel}
            maxWidth={false}
            fullWidth
            className="risk-it-move-popup"
        >
            <DialogContent className="cards-container">
                <Box display="flex" flexDirection="column">
                    <div className="cards-selection-area">
                        <Typography className="section-title" variant="h6" align="center">
                            Your Cards
                        </Typography>
                        <div className="cards-grid">
                            {availableCards.map(card => (
                                <CardDisplay
                                    key={card.id}
                                    card={card}
                                    onCardClick={props.isCardSelectable(selectedCards, card) ? handleCardClick : null}
                                    isSelected={selectedCards.includes(card.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="combinations-area">
                        <Typography className="section-title" variant="h6">
                            Selected Combinations
                        </Typography>
                        <div className="combinations-content">
                            {props.selectedCombinations.map((combination: CardCombination, index: number) => (
                                <div key={index} className="combination-row">
                                    <div className="combination-cards">
                                        {combination.cardIDs.map(cardId => {
                                            const card = props.playerCards.find((c: Card) => c.id === cardId)
                                            return card ? (
                                                <CardDisplay
                                                    key={card.id}
                                                    card={card}
                                                    onCardClick={null}
                                                    isSelected={true}
                                                />
                                            ) : null
                                        })}
                                    </div>
                                    <IconButton onClick={() => handleCombinationRemove(index)}>
                                        <CloseIcon/>
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    </div>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={props.onConfirm}
                    disabled={props.selectedCombinations.length === 0}
                >
                    Play cards
                </Button>
            </DialogActions>
        </Dialog>)
}

export default CardsPopup