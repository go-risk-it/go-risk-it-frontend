/**
 * Card combination logic for the Risk card-trading phase.
 * Cards are encoded as numeric values so that valid 3-card combinations can be identified
 * by their sum. A backtracking search determines whether a card can still participate
 * in at least one valid combination given the current selection state.
 */

import type { Card, CardType } from '$lib/types/game';

/**
 * Numeric encoding for each card type. Values are powers of 10 so that any
 * sum of exactly 3 card values uniquely identifies the combination of types.
 */
const CARD_VALUES: Record<CardType, number> = {
	artillery: 1,
	infantry: 10,
	cavalry: 100,
	jolly: 1000
};

/** All target sums that represent a legal 3-card trade-in. */
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

/**
 * Backtracking search to determine if a subset of remaining cards can exactly
 * fill the gap between the current partial sum and a target combination value.
 *
 * Iterates through `remainingValues` starting at `nextIndex` to avoid
 * revisiting earlier elements (prevents duplicate subsets).
 *
 * @param combinationValue - Remaining value needed to complete the combination
 * @param remainingValues - Numeric values of cards still available for selection
 * @param numCardsToPlay - How many more cards must be picked to reach 3
 * @param nextIndex - Start index in remainingValues to avoid duplicate subsets
 * @returns Whether the remaining cards can exactly match the needed value
 */
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

/**
 * Determine whether selecting a card can still lead to a valid 3-card combination,
 * given the cards already selected and those locked in existing combinations.
 * Used to grey out unplayable cards in the UI.
 * @param card - The candidate card the player wants to add to their selection
 * @param selectedCardIds - IDs of cards already selected in the current partial combination
 * @param allCards - All cards in the player's hand
 * @param existingCombinationCardIds - IDs of cards already committed to other combinations
 * @returns Whether the card can participate in at least one completable combination
 */
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

/**
 * Validate that exactly 3 cards form a recognized combination.
 * @param cards - The cards to validate
 * @returns Whether the cards match one of the valid combination sums
 */
export function isValidCombination(cards: Card[]): boolean {
	if (cards.length !== 3) return false;
	const total = cards.reduce((sum, c) => sum + getCardValue(c), 0);
	return VALID_COMBINATIONS.includes(total);
}
