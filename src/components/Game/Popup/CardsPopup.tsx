import React, {useState} from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import {Box, IconButton, Typography} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import {FaScroll, FaLayerGroup} from "react-icons/fa"

import "./Popup.css"
import {Card} from "../../../api/game/message/cardState.ts"
import CardDisplay from "../Cards/CardDisplay.tsx"
import {CardCombination} from "../../../api/game/message/cardMove.ts"

export interface CardsPopupProps {
    isVisible: boolean
    playerCards: Card[]
    onCombinationAdd: (combination: number[]) => void
    onCombinationRemove: (index: number) => void
    isCardSelectable: (selectedCards: number[], card: Card) => boolean
    selectedCombinations: CardCombination[]
    onConfirm: () => void
    onAdvance: () => void
}

const CardsPopup: React.FC<CardsPopupProps> = (props) => {
    const [selectedCards, setSelectedCards] = useState<number[]>([])

    const handleCardClick = (card: Card) => {
        let newSelectedCards: number[]
        if (selectedCards.includes(card.id)) {
            newSelectedCards = selectedCards.filter(id => id !== card.id)
        } else {
            newSelectedCards = [...selectedCards, card.id]
            if (newSelectedCards.length === 3) {
                props.onCombinationAdd(newSelectedCards)
                newSelectedCards = []
            }
        }
        setSelectedCards(newSelectedCards)
    }

    const handleCombinationRemove = (index: number) => {
        props.onCombinationRemove(index)
    }

    const availableCards = props.playerCards.filter(
        card => !props.selectedCombinations.some(
            combination => combination.cardIDs.includes(card.id)
        )
    )

    if (!props.isVisible) {
        return null
    }

    return (
        <Dialog 
            open={true} 
            className="risk-it-move-popup"
            maxWidth={false}
            fullWidth={false}
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }
            }}
        >
            <DialogContent>
                <Box className="cards-popup-container">
                    <div className="cards-selection-area">
                        <Typography className="section-title">
                            <FaScroll /> Available Cards ({availableCards.length})
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
                        <Typography className="section-title">
                            <FaLayerGroup /> Selected Combinations ({props.selectedCombinations.length})
                        </Typography>
                        <div className="combinations-content">
                            {props.selectedCombinations.length === 0 ? (
                                <div className="empty-combinations">
                                    Select three cards to form a combination
                                </div>
                            ) : (
                                props.selectedCombinations.map((combination: CardCombination, index: number) => (
                                    <div key={index} className="combination-row">
                                        <div className="combination-cards">
                                            {combination.cardIDs.map(cardId => {
                                                const card = props.playerCards.find(c => c.id === cardId)
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
                                        <IconButton 
                                            onClick={() => handleCombinationRemove(index)}
                                            size="small"
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={props.onAdvance}
                    sx={{
                        '&:not(:disabled)': {
                            color: 'rgba(255, 255, 255, 0.7) !important',
                            background: 'rgba(255, 255, 255, 0.1) !important'
                        }
                    }}
                >
                    Advance without using cards
                </Button>
                <Button
                    onClick={props.onConfirm}
                    disabled={props.selectedCombinations.length === 0}
                    sx={{
                        '&:not(:disabled)': {
                            background: 'linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, white)) !important'
                        }
                    }}
                >
                    Play combinations
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CardsPopup