<script lang="ts">
	import type { Region, GameState } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { attack, advance } from '$lib/api/moves';
	import { playAttack } from '$lib/audio/audio.svelte';
	import { getToasts } from '$lib/state/toast.svelte';

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

	const sourceRegion = $derived(
		interaction.sourceRegionId ? regionMap.get(interaction.sourceRegionId) : null
	);
	const targetRegion = $derived(
		interaction.targetRegionId ? regionMap.get(interaction.targetRegionId) : null
	);
	const maxAttackingTroops = $derived(Math.min((sourceRegion?.troops ?? 1) - 1, 3));

	let error = $state('');
	let submitting = $state(false);
	const toasts = getToasts();

	async function handleAttack() {
		if (!interaction.sourceRegionId || !interaction.targetRegionId || !sourceRegion || !targetRegion)
			return;
		error = '';
		submitting = true;
		try {
			await attack(gameState.id, {
				sourceRegionId: interaction.sourceRegionId,
				targetRegionId: interaction.targetRegionId,
				troopsInSource: sourceRegion.troops,
				troopsInTarget: targetRegion.troops,
				attackingTroops: interaction.attackingTroops
			});
			playAttack();
			moveState.setAttackSource('');
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Attack failed';
			error = msg;
			toasts.add(msg, 'error');
		} finally {
			submitting = false;
		}
	}

	async function handleAdvance() {
		try {
			await advance(gameState.id, { currentPhase: 'attack' });
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Advance failed';
			error = msg;
			toasts.add(msg, 'error');
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Attack</h3>

	{#if !interaction.sourceRegionId}
		<p class="text-sm text-gray-500">Click one of your regions (with 2+ troops) to attack from.</p>
	{:else if !interaction.targetRegionId}
		<div class="space-y-2">
			<div class="text-sm">
				<span class="text-gray-400">From:</span>
				<span class="font-semibold"
					>{interaction.sourceRegionId.replace(/_/g, ' ')} ({sourceRegion?.troops})</span
				>
			</div>
			<p class="text-sm text-gray-500">Click an adjacent enemy region to attack.</p>
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
				<span class="text-gray-400">Target:</span>
				<span class="font-semibold"
					>{interaction.targetRegionId.replace(/_/g, ' ')} ({targetRegion?.troops})</span
				>
			</div>

			<div>
				<label for="attack-slider" class="mb-1 block text-xs text-gray-400">Attacking troops</label
				>
				<input
					id="attack-slider"
					data-testid="attack-slider"
					type="range"
					min="1"
					max={maxAttackingTroops}
					bind:value={interaction.attackingTroops}
					oninput={(e) =>
						moveState.setAttackingTroops(parseInt((e.target as HTMLInputElement).value))}
					class="w-full accent-accent"
				/>
				<div class="text-center text-sm font-semibold">{interaction.attackingTroops}</div>
			</div>

			{#if error}
				<div class="text-xs text-red-400">{error}</div>
			{/if}

			<button
				onclick={handleAttack}
				disabled={submitting}
				data-testid="attack-btn"
				class="w-full cursor-pointer rounded-lg bg-red-600 py-2 text-sm font-semibold transition-colors hover:bg-red-500 disabled:opacity-50"
			>
				{submitting ? 'Attacking...' : `Attack with ${interaction.attackingTroops}`}
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
