<script lang="ts">
	import type { Region } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { deploy } from '$lib/api/moves';
	import { playDeploy } from '$lib/audio/audio.svelte';
	import { getToasts } from '$lib/state/toast.svelte';

	interface Props {
		regionMap: Map<string, Region>;
		deployableTroops: number;
		gameId: number;
		interaction: { phase: 'deploy'; regionId: string | null; troops: number };
		moveState: ReturnType<typeof createMoveState>;
	}

	let { regionMap, deployableTroops, gameId, interaction, moveState }: Props = $props();

	const selectedRegion = $derived(
		interaction.regionId ? regionMap.get(interaction.regionId) : null
	);
	const currentTroops = $derived(selectedRegion?.troops ?? 0);
	const maxTroops = $derived(currentTroops + deployableTroops);

	let error = $state('');
	let submitting = $state(false);
	const toasts = getToasts();

	async function handleDeploy() {
		if (!interaction.regionId || interaction.troops === 0) return;
		error = '';
		submitting = true;
		try {
			await deploy(gameId, {
				regionId: interaction.regionId,
				currentTroops: currentTroops,
				desiredTroops: currentTroops + interaction.troops
			});
			playDeploy();
			moveState.setDeployTroops(0);
			moveState.setDeployRegion('');
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Deploy failed';
			error = msg;
			toasts.add(msg, 'error');
		} finally {
			submitting = false;
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Deploy Troops</h3>

	<div class="rounded-lg bg-surface-700/50 px-3 py-2 text-center">
		<div class="text-2xl font-bold text-accent-light">{deployableTroops}</div>
		<div class="text-xs text-gray-400">troops remaining</div>
	</div>

	{#if selectedRegion && interaction.regionId}
		<div class="space-y-3">
			<div class="text-sm">
				<span class="text-gray-400">Region:</span>
				<span class="font-semibold">{interaction.regionId.replace(/_/g, ' ')}</span>
			</div>
			<div class="text-sm">
				<span class="text-gray-400">Current troops:</span>
				<span class="font-semibold">{currentTroops}</span>
			</div>

			<div>
				<label for="deploy-slider" class="mb-1 block text-xs text-gray-400">Add troops</label>
				<input
					id="deploy-slider"
					type="range"
					min="1"
					max={deployableTroops}
					bind:value={interaction.troops}
					oninput={(e) =>
						moveState.setDeployTroops(parseInt((e.target as HTMLInputElement).value))}
					class="w-full accent-accent"
				/>
				<div class="text-center text-sm font-semibold">{interaction.troops}</div>
			</div>

			{#if error}
				<div class="text-xs text-red-400">{error}</div>
			{/if}

			<button
				onclick={handleDeploy}
				disabled={submitting || interaction.troops === 0}
				class="w-full cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
			>
				{submitting ? 'Deploying...' : `Deploy ${interaction.troops} troops`}
			</button>
		</div>
	{:else}
		<p class="text-sm text-gray-500">Click a region you own to deploy troops.</p>
	{/if}
</div>
