<script lang="ts">
	import type { ConquerPhaseState, Region } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { conquer } from '$lib/api/moves';
	import { useAction } from '$lib/state/use-action.svelte';
	import { formatRegionName } from '$lib/utils/format';
	import TroopSlider from '../../ui/TroopSlider.svelte';

	interface Props {
		regionMap: Map<string, Region>;
		conquerState: ConquerPhaseState;
		gameId: number;
		interaction: { phase: 'conquer'; troops: number };
		moveState: ReturnType<typeof createMoveState>;
	}

	let { regionMap, conquerState, gameId, interaction, moveState }: Props = $props();

	const attackingRegion = $derived(regionMap.get(conquerState.attackingRegionId));
	const defendingRegion = $derived(regionMap.get(conquerState.defendingRegionId));
	const maxTroops = $derived((attackingRegion?.troops ?? 1) - 1);

	// Initialize troops to minimum on mount
	$effect(() => {
		if (interaction.troops < conquerState.minTroopsToMove) {
			moveState.setConquerTroops(conquerState.minTroopsToMove);
		}
	});

	const action = useAction();

	async function handleConquer() {
		await action.run(async () => {
			await conquer(gameId, { troops: interaction.troops });
		}, 'Conquer failed');
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-green-400">Move Troops to Conquered Territory</h3>

	<div class="space-y-2">
		<div class="text-sm">
			<span class="text-gray-400">From:</span>
			<span class="font-semibold"
				>{formatRegionName(conquerState.attackingRegionId)} ({attackingRegion?.troops})</span
			>
		</div>
		<div class="text-sm">
			<span class="text-gray-400">To:</span>
			<span class="font-semibold"
				>{formatRegionName(conquerState.defendingRegionId)} ({defendingRegion?.troops})</span
			>
		</div>
	</div>

	<TroopSlider
		id="conquer-slider"
		label="Troops to move (min: {conquerState.minTroopsToMove})"
		min={conquerState.minTroopsToMove}
		max={maxTroops}
		value={interaction.troops}
		onchange={(v) => moveState.setConquerTroops(v)}
		onmax={() => moveState.setConquerTroops(maxTroops)}
	/>

	{#if action.error}
		<div class="text-xs text-red-400">{action.error}</div>
	{/if}

	<button
		onclick={handleConquer}
		disabled={action.submitting}
		data-testid="conquer-btn"
		class="w-full cursor-pointer rounded-lg bg-green-600 py-2 text-sm font-semibold transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
	>
		{action.submitting ? 'Moving...' : `Move ${interaction.troops} troops`}
	</button>
</div>
