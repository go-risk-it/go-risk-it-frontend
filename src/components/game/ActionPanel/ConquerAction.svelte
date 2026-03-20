<script lang="ts">
	import type { ConquerPhaseState, Region } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { conquer } from '$lib/api/moves';
	import { getToasts } from '$lib/state/toast.svelte';

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

	let error = $state('');
	let submitting = $state(false);
	const toasts = getToasts();

	async function handleConquer() {
		error = '';
		submitting = true;
		try {
			await conquer(gameId, { troops: interaction.troops });
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Conquer failed';
			error = msg;
			toasts.add(msg, 'error');
		} finally {
			submitting = false;
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-green-400">Territory Conquered!</h3>

	<div class="space-y-2">
		<div class="text-sm">
			<span class="text-gray-400">From:</span>
			<span class="font-semibold"
				>{conquerState.attackingRegionId.replace(/_/g, ' ')} ({attackingRegion?.troops})</span
			>
		</div>
		<div class="text-sm">
			<span class="text-gray-400">To:</span>
			<span class="font-semibold"
				>{conquerState.defendingRegionId.replace(/_/g, ' ')} ({defendingRegion?.troops})</span
			>
		</div>
	</div>

	<div>
		<label for="conquer-slider" class="mb-1 block text-xs text-gray-400"
			>Troops to move (min: {conquerState.minTroopsToMove})</label
		>
		<input
			id="conquer-slider"
			data-testid="conquer-slider"
			type="range"
			min={conquerState.minTroopsToMove}
			max={maxTroops}
			bind:value={interaction.troops}
			oninput={(e) => moveState.setConquerTroops(parseInt((e.target as HTMLInputElement).value))}
			class="w-full accent-accent"
		/>
		<div class="text-center text-sm font-semibold">{interaction.troops}</div>
	</div>

	{#if error}
		<div class="text-xs text-red-400">{error}</div>
	{/if}

	<button
		onclick={handleConquer}
		disabled={submitting}
		data-testid="conquer-btn"
		class="w-full cursor-pointer rounded-lg bg-green-600 py-2 text-sm font-semibold transition-colors hover:bg-green-500 disabled:opacity-50"
	>
		{submitting ? 'Moving...' : `Move ${interaction.troops} troops`}
	</button>
</div>
