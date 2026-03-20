<script lang="ts">
	/**
	 * Reinforce phase action panel with a 3-step flow: (1) select source region,
	 * (2) select a connected friendly target, (3) choose troop count and execute.
	 * Also provides an "End Turn" button that advances past the reinforce phase.
	 * Target must be reachable through a connected chain of owned territories.
	 */
	import type { Region, GameState } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { reinforce, advance } from '$lib/api/moves';
	import { useAction } from '$lib/state/use-action.svelte';
	import { formatRegionName } from '$lib/utils/format';
	import TroopSlider from '../../ui/TroopSlider.svelte';
	import StepProgress from '../../ui/StepProgress.svelte';

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

	// Step progression: 1 = pick source, 2 = pick target, 3 = confirm reinforce
	const currentStep = $derived.by(() => {
		if (!interaction.sourceRegionId) return 1;
		if (!interaction.targetRegionId) return 2;
		return 3;
	});

	const action = useAction();

	/**
	 * Submits the reinforce move with current troop counts for both regions
	 * as optimistic concurrency guards. Resets source selection on success.
	 */
	async function handleReinforce() {
		if (!interaction.sourceRegionId || !interaction.targetRegionId || !sourceRegion || !targetRegion)
			return;
		await action.run(async () => {
			await reinforce(gameState.id, {
				sourceRegionId: interaction.sourceRegionId!,
				targetRegionId: interaction.targetRegionId!,
				troopsInSource: sourceRegion!.troops,
				troopsInTarget: targetRegion!.troops,
				movingTroops: interaction.movingTroops
			});
			moveState.setReinforceSource('');
		}, 'Reinforce failed');
	}

	/** Ends the turn by advancing past the reinforce phase. */
	async function handleAdvance() {
		await action.run(async () => {
			await advance(gameState.id, { currentPhase: 'reinforce' });
		}, 'Advance failed');
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Reinforce</h3>
		<StepProgress current={currentStep} total={3} />
	</div>

	{#if !interaction.sourceRegionId}
		<p class="text-sm text-gray-500">
			<span class="text-xs text-gray-400">Step 1/3:</span> Select your region (2+ troops)
		</p>
	{:else if !interaction.targetRegionId}
		<div class="space-y-2">
			<div class="text-sm">
				<span class="text-gray-400">From:</span>
				<span class="font-semibold"
					>{formatRegionName(interaction.sourceRegionId)} ({sourceRegion?.troops})</span
				>
			</div>
			<p class="text-sm text-gray-500">
				<span class="text-xs text-gray-400">Step 2/3:</span> Select a connected friendly region
			</p>
			<button
				onclick={() => moveState.setReinforceSource('')}
				class="cursor-pointer text-xs text-gray-500 underline hover:text-gray-300"
			>
				Cancel selection
			</button>
		</div>
	{:else}
		<div class="space-y-3">
			<div class="text-sm">
				<span class="text-gray-400">From:</span>
				<span class="font-semibold"
					>{formatRegionName(interaction.sourceRegionId)} ({sourceRegion?.troops})</span
				>
			</div>
			<div class="text-sm">
				<span class="text-gray-400">To:</span>
				<span class="font-semibold"
					>{formatRegionName(interaction.targetRegionId)} ({targetRegion?.troops})</span
				>
			</div>

			<div>
				<TroopSlider
					id="reinforce-slider"
					label="Moving troops"
					min={1}
					max={maxMovingTroops}
					value={interaction.movingTroops}
					onchange={(v) => moveState.setReinforceTroops(v)}
					onmax={() => moveState.setReinforceTroops(maxMovingTroops)}
				/>
			</div>

			{#if action.error}
				<div class="text-xs text-red-400">{action.error}</div>
			{/if}

			<button
				onclick={handleReinforce}
				disabled={action.submitting || interaction.movingTroops === 0}
				data-testid="reinforce-btn"
				class="w-full cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
			>
				{action.submitting ? 'Moving...' : `Move ${interaction.movingTroops} troops`}
			</button>
		</div>
	{/if}

	<button
		onclick={handleAdvance}
		data-testid="end-turn-btn"
		class="w-full cursor-pointer rounded-lg bg-surface-600 py-2 text-sm transition-colors hover:bg-surface-500"
	>
		End Turn
	</button>
</div>
