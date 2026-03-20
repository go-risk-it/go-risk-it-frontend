import type { Card, CardType } from '$lib/types/game';

const CARD_VALUES: Record<CardType, number> = {
	artillery: 1,
	infantry: 10,
	cavalry: 100,
	jolly: 1000
};

const VALID_COMBINATIONS = [
	3 * CARD_VALUES.artillery, // 3 artillery
	3 * CARD_VALUES.infantry, // 3 infantry
	3 * CARD_VALUES.cavalry, // 3 cavalry
	CARD_VALUES.artillery + CARD_VALUES.infantry + CARD_VALUES.cavalry, // one of each
	CARD_VALUES.jolly + 2 * CARD_VALUES.artillery, // jolly + 2 artillery
	CARD_VALUES.jolly + 2 * CARD_VALUES.infantry, // jolly + 2 infantry
	CARD_VALUES.jolly + 2 * CARD_VALUES.cavalry // jolly + 2 cavalry
];

function getCardValue(card: Card): number {
	return CARD_VALUES[card.type];
}

/** Recursive backtracking: can remaining cards form a valid combination? */
function canFormCardCombination(
	combinationValue: number,
	remainingValues: number[],
	numCardsToPlay: number,
	nextIndex = 0
): boolean {
	if (numCardsToPlay === 0) {
		return combinationValue === 0;
	}

	for (let i = nextIndex; i < remainingValues.length; i++) {
		if (
			canFormCardCombination(
				combinationValue - remainingValues[i],
				remainingValues,
				numCardsToPlay - 1,
				i + 1
			)
		) {
			return true;
		}
	}

	return false;
}

/** Check if adding a card to the selection can still form a valid 3-card combination */
export function isCardSelectable(
	card: Card,
	selectedCardIds: number[],
	allCards: Card[],
	existingCombinationCardIds: number[]
): boolean {
	if (selectedCardIds.includes(card.id)) return true;

	// Get cards not yet selected or in existing combinations
	const remainingValues = allCards
		.filter(
			(c) =>
				c.id !== card.id &&
				!selectedCardIds.includes(c.id) &&
				!existingCombinationCardIds.includes(c.id)
		)
		.map(getCardValue);

	// Value so far: selected cards + this card
	const currentValue =
		getCardValue(card) +
		selectedCardIds.reduce((acc, id) => {
			const c = allCards.find((card) => card.id === id);
			return acc + (c ? getCardValue(c) : 0);
		}, 0);

	const cardsNeeded = 2 - selectedCardIds.length;

	return VALID_COMBINATIONS.some((target) =>
		canFormCardCombination(target - currentValue, remainingValues, cardsNeeded)
	);
}

/** Check if exactly 3 selected cards form a valid combination */
export function isValidCombination(cards: Card[]): boolean {
	if (cards.length !== 3) return false;
	const total = cards.reduce((sum, c) => sum + getCardValue(c), 0);
	return VALID_COMBINATIONS.includes(total);
}
