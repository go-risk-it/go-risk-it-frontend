import {GameState, PhaseType} from "../../../api/message/gameState.ts"
import {Card, CardState} from "../../../api/message/cardState.ts"
import {CardMove} from "../../../api/message/cardMove.ts"
import {CardAction, CardActionType} from "../../../hooks/useCardMoveReducer.ts"
import {CardsPopupProps} from "../Popup/CardsPopup.tsx"

enum CardValue {
    ARTILLERY = 1,
    INFANTRY = 10,
    CAVALRY = 100,
    JOLLY = 1000
}

const VALID_COMBINATIONS = [
    3 * CardValue.ARTILLERY,
    3 * CardValue.INFANTRY,
    3 * CardValue.CAVALRY,
    CardValue.ARTILLERY + CardValue.INFANTRY + CardValue.CAVALRY,
    CardValue.JOLLY + 2 * CardValue.ARTILLERY,
    CardValue.JOLLY + 2 * CardValue.INFANTRY,
    CardValue.JOLLY + 2 * CardValue.CAVALRY,
]

const getCard = (cardState: CardState, cardId: number): Card => {
    const card = cardState.cards.find(card => card.id === cardId)
    if (!card) {
        throw Error(`Card with id ${cardId} not found`)
    }
    return card
}

const getCardValue = (card: Card): number => {
    switch (card.type) {
        case "artillery":
            return CardValue.ARTILLERY
        case "infantry":
            return CardValue.INFANTRY
        case "cavalry":
            return CardValue.CAVALRY
        case "jolly":
            return CardValue.JOLLY
        default:
            throw Error(`Invalid card type: ${card.type}`)
    }
}

export const getCardsPopupProps = (
    doPlayCards: (cardMove: CardMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    cardState: CardState,
    cardMove: CardMove,
    dispatchCardMove: (action: CardAction) => void,
): CardsPopupProps => {
    return {
        isVisible: gameState.phaseType === PhaseType.CARDS,
        playerCards: cardState.cards,
        onCombinationAdd: (combination: number[]) => {
            dispatchCardMove({
                type: CardActionType.COMBINATION_ADD,
                combination: combination,
            })
        },
        onCombinationRemove: (combinationIndex: number) => {
            dispatchCardMove({
                type: CardActionType.COMBINATION_REMOVE,
                combinationIndex: combinationIndex,
            })
        },
        isCardSelectable: (selectedCards: number[], card: Card) => {
            // get the remaining cards: the ones that are not in the selected cards and not in the selected combinations
            const remainingCardsValues = cardState.cards
                .filter(c =>
                    c.id !== card.id &&
                    !selectedCards.includes(c.id) &&
                    !cardMove.combinations.some(combination => combination.cardIDs.includes(c.id)))
                .map(getCardValue)

            const thisCardValue = getCardValue(card)

            if (selectedCards.length === 0) {
                for (const validCombination of VALID_COMBINATIONS) {
                    for (let i = 0; i < remainingCardsValues.length; i++) {
                        for (let j = i + 1; j < remainingCardsValues.length; j++) {
                            if (validCombination === thisCardValue + remainingCardsValues[i] + remainingCardsValues[j]) {
                                return true
                            }
                        }
                    }
                }
            } else {
                const firstCardValue = getCardValue(getCard(cardState, selectedCards[0]))

                if (selectedCards.length === 1) {
                    for (const validCombination of VALID_COMBINATIONS) {
                        if (remainingCardsValues.includes(validCombination - thisCardValue - firstCardValue)) {
                            return true
                        }
                    }
                } else if (selectedCards.length === 2) {
                    const secondCardValue = getCardValue(getCard(cardState, selectedCards[1]))
                    for (const validCombination of VALID_COMBINATIONS) {
                        if (validCombination === firstCardValue + secondCardValue + thisCardValue) {
                            return true
                        }
                    }
                } else {
                    throw Error("Invalid number of selected cards")
                }
            }
            return false
        },
        selectedCombinations: cardMove.combinations,
        onCancel: () => {
        },
        onConfirm: () => {
            doPlayCards(cardMove, gameState).then(response => {
                console.log("Cards response: ", response)
            }).catch(error => {
                console.error("Error playing cards: ", error)
            })
            dispatchCardMove({type: CardActionType.RESET})
        },
    }
}
