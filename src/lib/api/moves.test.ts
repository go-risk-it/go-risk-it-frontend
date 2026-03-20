import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	api: {
		post: vi.fn().mockResolvedValue({})
	}
}));

import { api } from './client';
import { deploy, attack, conquer, reinforce, advance, playCards } from './moves';

const mockPost = vi.mocked(api.post);

describe('move API wrappers', () => {
	beforeEach(() => {
		mockPost.mockClear();
	});

	it('deploy calls correct endpoint', async () => {
		const move = { regionId: 'r1', currentTroops: 1, desiredTroops: 3 };
		await deploy(42, move);
		expect(mockPost).toHaveBeenCalledWith('/games/42/moves/deployments', move);
	});

	it('attack calls correct endpoint', async () => {
		const move = {
			sourceRegionId: 'r1',
			targetRegionId: 'r2',
			troopsInSource: 5,
			troopsInTarget: 2,
			attackingTroops: 3
		};
		await attack(42, move);
		expect(mockPost).toHaveBeenCalledWith('/games/42/moves/attacks', move);
	});

	it('conquer calls correct endpoint', async () => {
		const move = { troops: 3 };
		await conquer(42, move);
		expect(mockPost).toHaveBeenCalledWith('/games/42/moves/conquers', move);
	});

	it('reinforce calls correct endpoint', async () => {
		const move = {
			sourceRegionId: 'r1',
			targetRegionId: 'r2',
			troopsInSource: 5,
			troopsInTarget: 2,
			movingTroops: 3
		};
		await reinforce(42, move);
		expect(mockPost).toHaveBeenCalledWith('/games/42/moves/reinforcements', move);
	});

	it('advance calls correct endpoint', async () => {
		const move = { currentPhase: 'attack' };
		await advance(42, move);
		expect(mockPost).toHaveBeenCalledWith('/games/42/advancements', move);
	});

	it('playCards calls correct endpoint', async () => {
		const move = { combinations: [{ cardIDs: [1, 2, 3] }] };
		await playCards(42, move);
		expect(mockPost).toHaveBeenCalledWith('/games/42/moves/cards', move);
	});
});
