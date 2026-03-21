import { describe, it, expect } from 'vitest';
import { isValidCombination, isCardSelectable, getCombinationReward, getRegionBonuses } from './cards';
import type { Card } from '$lib/types/game';

function card(id: number, type: Card['type']): Card {
	return { id, type, region: `r${id}` };
}

describe('isValidCombination', () => {
	it('accepts 3 artillery', () => {
		expect(
			isValidCombination([card(1, 'artillery'), card(2, 'artillery'), card(3, 'artillery')])
		).toBe(true);
	});

	it('accepts 3 infantry', () => {
		expect(
			isValidCombination([card(1, 'infantry'), card(2, 'infantry'), card(3, 'infantry')])
		).toBe(true);
	});

	it('accepts 3 cavalry', () => {
		expect(isValidCombination([card(1, 'cavalry'), card(2, 'cavalry'), card(3, 'cavalry')])).toBe(
			true
		);
	});

	it('accepts one of each', () => {
		expect(
			isValidCombination([card(1, 'artillery'), card(2, 'infantry'), card(3, 'cavalry')])
		).toBe(true);
	});

	it('accepts jolly + 2 artillery', () => {
		expect(isValidCombination([card(1, 'jolly'), card(2, 'artillery'), card(3, 'artillery')])).toBe(
			true
		);
	});

	it('accepts jolly + 2 infantry', () => {
		expect(isValidCombination([card(1, 'jolly'), card(2, 'infantry'), card(3, 'infantry')])).toBe(
			true
		);
	});

	it('accepts jolly + 2 cavalry', () => {
		expect(isValidCombination([card(1, 'jolly'), card(2, 'cavalry'), card(3, 'cavalry')])).toBe(
			true
		);
	});

	it('rejects wrong count (2 cards)', () => {
		expect(isValidCombination([card(1, 'artillery'), card(2, 'artillery')])).toBe(false);
	});

	it('rejects wrong count (4 cards)', () => {
		expect(
			isValidCombination([
				card(1, 'artillery'),
				card(2, 'artillery'),
				card(3, 'artillery'),
				card(4, 'artillery')
			])
		).toBe(false);
	});

	it('rejects mixed pair (2 artillery + 1 infantry)', () => {
		expect(
			isValidCombination([card(1, 'artillery'), card(2, 'artillery'), card(3, 'infantry')])
		).toBe(false);
	});

	it('rejects jolly + mixed pair', () => {
		expect(isValidCombination([card(1, 'jolly'), card(2, 'artillery'), card(3, 'infantry')])).toBe(
			false
		);
	});
});

describe('isCardSelectable', () => {
	const allCards = [
		card(1, 'artillery'),
		card(2, 'artillery'),
		card(3, 'artillery'),
		card(4, 'infantry'),
		card(5, 'cavalry')
	];

	it('returns true when card can complete a valid combo', () => {
		// Already selected [1,2] (artillery pair), card 3 (artillery) completes triple
		expect(isCardSelectable(card(3, 'artillery'), [1, 2], allCards, [])).toBe(true);
	});

	it('returns true for card that starts a valid path', () => {
		// No selection yet, card 1 can form [1,2,3] artillery triple
		expect(isCardSelectable(card(1, 'artillery'), [], allCards, [])).toBe(true);
	});

	it('returns true for already-selected card', () => {
		expect(isCardSelectable(card(1, 'artillery'), [1], allCards, [])).toBe(true);
	});

	it('returns false when card cannot form any combo', () => {
		// Only have: infantry(4), cavalry(5), plus this card. With [4] selected + cavalry(5) = mixed pair
		const limitedCards = [card(4, 'infantry'), card(5, 'cavalry')];
		expect(isCardSelectable(card(4, 'infantry'), [], limitedCards, [])).toBe(false);
	});

	it('excludes cards in existing combinations from pool', () => {
		// Cards 1,2,3 are in existing combo, only card 4 (infantry) left + new card
		const cardsWithExtra = [...allCards, card(6, 'infantry'), card(7, 'infantry')];
		expect(isCardSelectable(card(4, 'infantry'), [], cardsWithExtra, [1, 2, 3])).toBe(true);
	});
});

describe('getCombinationReward', () => {
	it('returns 4 for 3 artillery', () => {
		expect(
			getCombinationReward([card(1, 'artillery'), card(2, 'artillery'), card(3, 'artillery')])
		).toBe(4);
	});

	it('returns 6 for 3 infantry', () => {
		expect(
			getCombinationReward([card(1, 'infantry'), card(2, 'infantry'), card(3, 'infantry')])
		).toBe(6);
	});

	it('returns 8 for 3 cavalry', () => {
		expect(
			getCombinationReward([card(1, 'cavalry'), card(2, 'cavalry'), card(3, 'cavalry')])
		).toBe(8);
	});

	it('returns 10 for 1 of each', () => {
		expect(
			getCombinationReward([card(1, 'artillery'), card(2, 'infantry'), card(3, 'cavalry')])
		).toBe(10);
	});

	it('returns 12 for jolly + 2 same', () => {
		expect(
			getCombinationReward([card(1, 'jolly'), card(2, 'cavalry'), card(3, 'cavalry')])
		).toBe(12);
	});

	it('returns null for invalid combination', () => {
		expect(
			getCombinationReward([card(1, 'artillery'), card(2, 'artillery'), card(3, 'infantry')])
		).toBeNull();
	});

	it('returns null for wrong card count', () => {
		expect(getCombinationReward([card(1, 'artillery'), card(2, 'artillery')])).toBeNull();
	});
});

describe('getRegionBonuses', () => {
	it('returns regions owned by the player', () => {
		const cards = [card(1, 'artillery'), card(2, 'infantry'), card(3, 'cavalry')];
		const owned = new Set(['r1', 'r3']);
		expect(getRegionBonuses(cards, owned)).toEqual(['r1', 'r3']);
	});

	it('returns empty when no regions are owned', () => {
		const cards = [card(1, 'artillery'), card(2, 'infantry'), card(3, 'cavalry')];
		const owned = new Set(['r99']);
		expect(getRegionBonuses(cards, owned)).toEqual([]);
	});

	it('skips jolly cards (empty region)', () => {
		const jolly: Card = { id: 10, type: 'jolly', region: '' };
		const cards = [jolly, card(2, 'infantry'), card(3, 'cavalry')];
		const owned = new Set(['', 'r2', 'r3']);
		expect(getRegionBonuses(cards, owned)).toEqual(['r2', 'r3']);
	});
});
