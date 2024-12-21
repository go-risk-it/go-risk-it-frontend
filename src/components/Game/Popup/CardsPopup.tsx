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
import {Card, CardState} from "../../../api/message/cardState.ts"
import CardDisplay from "../CardDisplay/CardDisplay.tsx"
import {CardActionType, useCardMoveReducer} from "../../../hooks/useCardMoveReducer.tsx"

export interface CardsPopupProps {
    isVisible: boolean
    cardState: CardState
    getSvgPathForRegion: (regionId: string) => string
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
    const {cardMove, dispatchCardMove} = useCardMoveReducer()
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
                console.log("Forming combination")
                dispatchCardMove({type: CardActionType.SELECT_COMBINATION, combination: newSelectedCards})
                newSelectedCards = []
            }
        }
        setSelectedCards(newSelectedCards)
    }

    const handleDeselectCombination = (index: number) => {
        dispatchCardMove({type: CardActionType.UNSELECT_COMBINATION, combinationIndex: index})
    }

    const availableCards = props.cardState.cards.filter(card => !cardMove.combinations.some(combination => combination.cardIDs.includes(card.id)))

    return (
        <Dialog open={props.isVisible} onClose={props.onCancel}>
            <DialogTitle>Cards</DialogTitle>
            <DialogContent className="cards-container">
                <Box display="flex" flexWrap="wrap" justifyContent="center">
                    {availableCards.map(card => (
                        <CardDisplay
                            key={card.id}
                            card={card}
                            getSvgPathForRegion={props.getSvgPathForRegion}
                            onCardClick={handleCardClick}
                            isSelected={selectedCards.includes(card.id)}
                        />
                    ))}
                </Box>
                <Box display="flex" flexDirection="column" mt={2}>
                    {cardMove.combinations.map((combination, index) => (
                        <Box key={index} display="flex" alignItems="center">
                            {combination.cardIDs.map(cardId => {
                                const card = props.cardState.cards.find(c => c.id === cardId)
                                return card ? (
                                    <CardDisplay
                                        key={card.id}
                                        card={card}
                                        getSvgPathForRegion={props.getSvgPathForRegion}
                                        onCardClick={null}
                                        isSelected={false}
                                    />
                                ) : null
                            })}
                            <IconButton onClick={() => handleDeselectCombination(index)}>
                                <CloseIcon/>
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onConfirm} disabled={cardMove.combinations.length === 0}>Play cards</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CardsPopup