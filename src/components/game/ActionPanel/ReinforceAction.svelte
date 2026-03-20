<script lang="ts">
	import type { Region, GameState } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { reinforce, advance } from '$lib/api/moves';
	import { getToasts } from '$lib/state/toast.svelte';

	interface Props {
		regionMap: Map<string, Region>;
		gameState: GameState;
		interaction: {
			phase: 'reinforce';
			sourceRegionId: string | null;
			targetRegionId: string | null;
			movingTroops: number;
		};
		moveState: ReturnType<typeof createMoveState>;
	}

	let { regionMap, gameState, interaction, moveState }: Props = $props();

	const sourceRegion = $derived(
		interaction.sourceRegionId ? regionMap.get(interaction.sourceRegionId) : null
	);
	const targetRegion = $derived(
		interaction.targetRegionId ? regionMap.get(interaction.targetRegionId) : null
	);
	const maxMovingTroops = $derived((sourceRegion?.troops ?? 1) - 1);

	let error = $state('');
	let submitting = $state(false);
	const toasts = getToasts();

	async function handleReinforce() {
		if (!interaction.sourceRegionId || !interaction.targetRegionId || !sourceRegion || !targetRegion)
			return;
		error = '';
		submitting = true;
		try {
			await reinforce(gameState.id, {
				sourceRegionId: interaction.sourceRegionId,
				targetRegionId: interaction.targetRegionId,
				troopsInSource: sourceRegion.troops,
				troopsInTarget: targetRegion.troops,
				movingTroops: interaction.movingTroops
			});
			moveState.setReinforceSource('');
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Reinforce failed';
			error = msg;
			toasts.add(msg, 'error');
		} finally {
			submitting = false;
		}
	}

	async function handleAdvance() {
		try {
			await advance(gameState.id, { currentPhase: 'reinforce' });
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Advance failed';
			error = msg;
			toasts.add(msg, 'error');
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Reinforce</h3>

	{#if !interaction.sourceRegionId}
		<p class="text-sm text-gray-500">Click one of your regions (with 2+ troops) to move from.</p>
	{:else if !interaction.targetRegionId}
		<div class="space-y-2">
			<div class="text-sm">
				<span class="text-gray-400">From:</span>
				<span class="font-semibold"
					>{interaction.sourceRegionId.replace(/_/g, ' ')} ({sourceRegion?.troops})</span
				>
			</div>
			<p class="text-sm text-gray-500">Click a connected friendly region to reinforce.</p>
		</div>
	{:else}
		<div class="space-y-3">
			<div class="text-sm">
				<span class="text-gray-400">From:</span>
				<span class="font-semibold"
					>{interaction.sourceRegionId.replace(/_/g, ' ')} ({sourceRegion?.troops})</span
				>
			</div>
			<div class="text-sm">
				<span class="text-gray-400">To:</span>
				<span class="font-semibold"
					>{interaction.targetRegionId.replace(/_/g, ' ')} ({targetRegion?.troops})</span
				>
			</div>

			<div>
				<label for="reinforce-slider" class="mb-1 block text-xs text-gray-400">Moving troops</label
				>
				<input
					id="reinforce-slider"
					type="range"
					min="1"
					max={maxMovingTroops}
					bind:value={interaction.movingTroops}
					oninput={(e) =>
						moveState.setReinforceTroops(parseInt((e.target as HTMLInputElement).value))}
					class="w-full accent-accent"
				/>
				<div class="text-center text-sm font-semibold">{interaction.movingTroops}</div>
			</div>

			{#if error}
				<div class="text-xs text-red-400">{error}</div>
			{/if}

			<button
				onclick={handleReinforce}
				disabled={submitting || interaction.movingTroops === 0}
				class="w-full cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
			>
				{submitting ? 'Moving...' : `Move ${interaction.movingTroops} troops`}
			</button>
		</div>
	{/if}

	<button
		onclick={handleAdvance}
		class="w-full cursor-pointer rounded-lg bg-surface-600 py-2 text-sm transition-colors hover:bg-surface-500"
	>
		End Turn
	</button>
</div>
