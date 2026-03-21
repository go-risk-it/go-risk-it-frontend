<script lang="ts">
	/**
	 * Displays the player's secret mission objective with a live progress bar.
	 * Computes progress differently per mission type: territory count for
	 * TWENTY_FOUR_TERRITORIES, territories with 2+ troops for EIGHTEEN_TERRITORIES_TWO_TROOPS,
	 * fully-owned continent count for TWO_CONTINENTS variants, and target player
	 * elimination status for ELIMINATE_PLAYER.
	 */
	import type { MissionState, BoardState, PlayerState } from '$lib/types/game';
	import type { MapLayer, Continent } from '$lib/types/map';

	interface Props {
		mission: MissionState | null;
		boardState: BoardState | null;
		myUserId: string | null;
		players: PlayerState[];
		mapLayers: MapLayer[];
		continents: Continent[];
	}

	let { mission, boardState, myUserId, players, mapLayers, continents }: Props = $props();

	// Count territories owned by current player
	const myTerritoryCount = $derived.by(() => {
		if (!boardState || !myUserId) return 0;
		return boardState.regions.filter((r) => r.ownerId === myUserId).length;
	});

	// Count territories with 2+ troops owned by current player
	const myTerritoriesWithTwoTroops = $derived.by(() => {
		if (!boardState || !myUserId) return 0;
		return boardState.regions.filter((r) => r.ownerId === myUserId && r.troops >= 2).length;
	});

	// Map from continent ID to its region IDs (derived from map layer data)
	const continentRegions = $derived.by(() => {
		const map = new Map<string, string[]>();
		for (const layer of mapLayers) {
			const existing = map.get(layer.continent) ?? [];
			existing.push(layer.id);
			map.set(layer.continent, existing);
		}
		return map;
	});

	// For continent-based missions: checks full ownership of each target continent
	const continentProgress = $derived.by(() => {
		if (!mission || !boardState || !myUserId) return { owned: 0, target: 0, names: [] as string[] };

		let targetContinentIds: string[] = [];

		if (mission.type === 'TWO_CONTINENTS' || mission.type === 'TWO_CONTINENTS_PLUS_ONE') {
			targetContinentIds = [mission.details.continent1, mission.details.continent2];
		}

		if (targetContinentIds.length === 0) return { owned: 0, target: 0, names: [] as string[] };

		let owned = 0;
		const names: string[] = [];
		for (const cId of targetContinentIds) {
			const regionIds = continentRegions.get(cId) ?? [];
			const allOwned =
				regionIds.length > 0 &&
				regionIds.every((rId) => {
					const region = boardState!.regions.find((r) => r.id === rId);
					return region && region.ownerId === myUserId;
				});
			const continent = continents.find((c) => c.id === cId);
			names.push(continent?.name ?? cId);
			if (allOwned) owned++;
		}
		return { owned, target: targetContinentIds.length, names };
	});

	// Target player name for ELIMINATE_PLAYER
	const targetPlayerName = $derived.by(() => {
		if (!mission || mission.type !== 'ELIMINATE_PLAYER') return null;
		const targetId = mission.details.targetUserId;
		const player = players.find((p) => p.userId === targetId);
		return player?.name ?? 'Unknown';
	});

	const targetPlayerDead = $derived.by(() => {
		if (!mission || mission.type !== 'ELIMINATE_PLAYER') return false;
		const targetId = mission.details.targetUserId;
		const player = players.find((p) => p.userId === targetId);
		return player?.status === 'dead';
	});

	const missionText = $derived.by(() => {
		if (!mission) return 'Loading mission...';
		switch (mission.type) {
			case 'TWO_CONTINENTS':
				return `Conquer ${continentProgress.names.join(' & ')}`;
			case 'TWO_CONTINENTS_PLUS_ONE':
				return `Conquer ${continentProgress.names.join(' & ')} + 1 more`;
			case 'EIGHTEEN_TERRITORIES_TWO_TROOPS':
				return 'Hold 18 territories with 2+ troops each';
			case 'TWENTY_FOUR_TERRITORIES':
				return 'Conquer 24 territories';
			case 'ELIMINATE_PLAYER':
				return `Eliminate ${targetPlayerName ?? 'a player'}`;
			default:
				return 'Unknown mission';
		}
	});

	const progressText = $derived.by(() => {
		if (!mission || !boardState) return null;
		switch (mission.type) {
			case 'TWENTY_FOUR_TERRITORIES':
				return `${myTerritoryCount}/24`;
			case 'EIGHTEEN_TERRITORIES_TWO_TROOPS':
				return `${myTerritoriesWithTwoTroops}/18`;
			case 'TWO_CONTINENTS':
				return `${continentProgress.owned}/${continentProgress.target}`;
			case 'TWO_CONTINENTS_PLUS_ONE':
				return `${continentProgress.owned}/${continentProgress.target} + ?`;
			case 'ELIMINATE_PLAYER':
				return targetPlayerDead ? 'Done!' : 'In progress';
			default:
				return null;
		}
	});

	const progressPercent = $derived.by(() => {
		if (!mission || !boardState) return 0;
		switch (mission.type) {
			case 'TWENTY_FOUR_TERRITORIES':
				return Math.min(100, Math.round((myTerritoryCount / 24) * 100));
			case 'EIGHTEEN_TERRITORIES_TWO_TROOPS':
				return Math.min(100, Math.round((myTerritoriesWithTwoTroops / 18) * 100));
			case 'TWO_CONTINENTS':
				return continentProgress.target > 0
					? Math.round((continentProgress.owned / continentProgress.target) * 100)
					: 0;
			case 'TWO_CONTINENTS_PLUS_ONE':
				return continentProgress.target > 0
					? Math.round((continentProgress.owned / continentProgress.target) * 100)
					: 0;
			case 'ELIMINATE_PLAYER':
				return targetPlayerDead ? 100 : 0;
			default:
				return 0;
		}
	});
</script>

<div class="rounded-lg bg-surface-700/50 px-3 py-2">
	<div class="mb-1 text-xs font-semibold text-gray-400 uppercase">Mission</div>
	<div class="text-sm">{missionText}</div>
	{#if progressText}
		<div class="mt-2">
			<div class="mb-1 flex items-center justify-between text-xs">
				<span class="text-gray-400">Progress</span>
				<span class="font-semibold" class:text-green-400={progressPercent >= 100}
					>{progressText}</span
				>
			</div>
			<div class="h-1.5 overflow-hidden rounded-full bg-surface-600">
				<div
					class="h-full rounded-full transition-all duration-500"
					class:bg-accent={progressPercent < 100}
					class:bg-green-400={progressPercent >= 100}
					style="width: {progressPercent}%"
				></div>
			</div>
		</div>
	{/if}
</div>
