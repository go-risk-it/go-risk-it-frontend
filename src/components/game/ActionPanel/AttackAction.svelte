<script lang="ts">
	/**
	 * Attack phase action panel with a 3-step flow: (1) select source region,
	 * (2) select adjacent enemy target, (3) choose troop count and execute.
	 * Also provides a "Skip to Reinforce" button that advances the phase.
	 * Max attacking troops is capped at min(source troops - 1, 3) per Risk rules.
	 */
	import type { Region, GameState } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { attack, advance } from '$lib/api/moves';
	import { playAttack } from '$lib/audio/audio.svelte';
	import { useAction } from '$lib/state/use-action.svelte';
	import { formatRegionName } from '$lib/utils/format';
	import TroopSlider from '../../ui/TroopSlider.svelte';
	import StepProgress from '../../ui/StepProgress.svelte';

	interface Props {
		regionMap: Map<string, Region>;
		gameState: GameState;
		interaction: {
			phase: 'attack';
			sourceRegionId: string | null;
			targetRegionId: string | null;
			attackingTroops: number;
		};
		moveState: ReturnType<typeof createMoveState>;
	}

	let { regionMap, gameState, interaction, moveState }: Props = $props();

	const action = useAction();

	const sourceRegion = $derived(
		interaction.sourceRegionId ? regionMap.get(interaction.sourceRegionId) : null
	);
	const targetRegion = $derived(
		interaction.targetRegionId ? regionMap.get(interaction.targetRegionId) : null
	);
	const maxAttackingTroops = $derived(Math.min((sourceRegion?.troops ?? 1) - 1, 3));

	// Step progression: 1 = pick source, 2 = pick target, 3 = confirm attack
	const currentStep = $derived.by(() => {
		if (!interaction.sourceRegionId) return 1;
		if (!interaction.targetRegionId) return 2;
		return 3;
	});

	/**
	 * Submits the attack move with current troop counts for both regions as
	 * optimistic concurrency guards. Resets source selection on success so
	 * the player can immediately launch another attack.
	 */
	async function handleAttack() {
		if (!interaction.sourceRegionId || !interaction.targetRegionId || !sourceRegion || !targetRegion)
			return;
		await action.run(async () => {
			await attack(gameState.id, {
				sourceRegionId: interaction.sourceRegionId!,
				targetRegionId: interaction.targetRegionId!,
				troopsInSource: sourceRegion!.troops,
				troopsInTarget: targetRegion!.troops,
				attackingTroops: interaction.attackingTroops
			});
			playAttack();
			moveState.setAttackSource('');
		}, 'Attack failed');
	}

	/** Advances past the attack phase without attacking (skip to reinforce). */
	async function handleAdvance() {
		await action.run(async () => {
			await advance(gameState.id, { currentPhase: 'attack' });
		}, 'Advance failed');
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Attack</h3>
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
				<span class="text-xs text-gray-400">Step 2/3:</span> Select an enemy target
			</p>
			<button
				onclick={() => moveState.setAttackSource('')}
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
				<span class="text-gray-400">Target:</span>
				<span class="font-semibold"
					>{formatRegionName(interaction.targetRegionId)} ({targetRegion?.troops})</span
				>
			</div>

			<div>
				<TroopSlider
					id="attack-slider"
					label="Attacking troops"
					min={1}
					max={maxAttackingTroops}
					value={interaction.attackingTroops}
					onchange={(v) => moveState.setAttackingTroops(v)}
					onmax={() => moveState.setAttackingTroops(maxAttackingTroops)}
				/>
			</div>

			{#if action.error}
				<div class="text-xs text-red-400">{action.error}</div>
			{/if}

			<button
				onclick={handleAttack}
				disabled={action.submitting}
				data-testid="attack-btn"
				class="w-full cursor-pointer rounded-lg bg-red-600 py-2 text-sm font-semibold transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{action.submitting ? 'Attacking...' : `Attack with ${interaction.attackingTroops}`}
			</button>
		</div>
	{/if}

	<button
		onclick={handleAdvance}
		data-testid="skip-attack-btn"
		class="w-full cursor-pointer rounded-lg bg-surface-600 py-2 text-sm transition-colors hover:bg-surface-500"
	>
		Skip to Reinforce
	</button>
</div>
