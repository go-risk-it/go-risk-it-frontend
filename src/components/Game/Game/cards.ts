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

const getCard = (cardState: CardState, cardID: number): Card => {
    const card = cardState.cards.find(card => card.id === cardID)
    if (!card) {
        throw Error(`Card with id ${cardID} not found`)
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

/*
 * Check if with the remaining cards it is possible to form a combination of numCardsToPlay cards with the given value
 */
const canFormCardCombination = (
    combinationValue: number,
    remainingCardsValues: number[],
    numCardsToPlay: number,
    nextCardIndex: number = 0,
): boolean => {
    if (numCardsToPlay === 0) {
        return combinationValue === 0
    }

    for (let i = nextCardIndex; i < remainingCardsValues.length; i++) {
        if (canFormCardCombination(combinationValue - remainingCardsValues[i], remainingCardsValues, numCardsToPlay - 1, i + 1)) {
            return true
        }
    }

    return false
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
            // either the card is in the selected cards or it can form a combination with the selected cards
            if (selectedCards.includes(card.id)) {
                return true
            }

            const remainingCardsValues = cardState.cards
                .filter(c =>
                    c.id !== card.id &&
                    !selectedCards.includes(c.id) &&
                    !cardMove.combinations.some(combination => combination.cardIDs.includes(c.id)))
                .map(getCardValue)

            const currentValue = getCardValue(card) +
                selectedCards.reduce((acc, cardID) => acc + getCardValue(getCard(cardState, cardID)), 0)

            return VALID_COMBINATIONS.some(
                validCombination => canFormCardCombination(validCombination - currentValue, remainingCardsValues, 2 - selectedCards.length),
            )
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
