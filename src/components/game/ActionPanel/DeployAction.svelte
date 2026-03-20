<script lang="ts">
	import type { Region } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { deploy } from '$lib/api/moves';
	import { playDeploy } from '$lib/audio/audio.svelte';
	import { useAction } from '$lib/state/use-action.svelte';
	import { formatRegionName } from '$lib/utils/format';
	import TroopSlider from '../../ui/TroopSlider.svelte';

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

	const action = useAction();

	async function handleDeploy() {
		if (!interaction.regionId || interaction.troops === 0) return;
		await action.run(async () => {
			await deploy(gameId, {
				regionId: interaction.regionId!,
				currentTroops: currentTroops,
				desiredTroops: currentTroops + interaction.troops
			});
			playDeploy();
			moveState.setDeployTroops(0);
			moveState.setDeployRegion('');
		}, 'Deploy failed');
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
				<span class="font-semibold">{formatRegionName(interaction.regionId)}</span>
			</div>
			<div class="text-sm">
				<span class="text-gray-400">Current troops:</span>
				<span class="font-semibold">{currentTroops}</span>
			</div>

			<div>
				<TroopSlider
					id="deploy-slider"
					label="Add troops"
					min={1}
					max={deployableTroops}
					value={interaction.troops}
					onchange={(v) => moveState.setDeployTroops(v)}
					onmax={() => moveState.setDeployTroops(deployableTroops)}
				/>
			</div>

			{#if action.error}
				<div class="text-xs text-red-400">{action.error}</div>
			{/if}

			<button
				onclick={handleDeploy}
				disabled={action.submitting || interaction.troops === 0}
				data-testid="deploy-btn"
				class="w-full cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
			>
				{action.submitting ? 'Deploying...' : `Deploy ${interaction.troops} troops`}
			</button>
		</div>
	{:else}
		<p class="text-sm text-gray-500">Click a region you own to deploy troops.</p>
	{/if}
</div>
