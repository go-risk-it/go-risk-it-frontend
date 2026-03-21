<script lang="ts">
	/**
	 * Groups Region components under a continent SVG <g> element.
	 * Resolves each layer's game state (owner color, selection, valid target status)
	 * and passes it down to the Region component for rendering.
	 * When a player controls all regions, shows a semi-transparent wash and bonus label.
	 */
	import type { Region as RegionType } from '$lib/types/game';
	import type { PhaseType } from '$lib/types/game';
	import type { MapLayer, Continent as ContinentType } from '$lib/types/map';
	import Region from './Region.svelte';

	interface Props {
		continent: ContinentType;
		layers: MapLayer[];
		regionMap: Map<string, RegionType>;
		playerColors: Map<string, string>;
		selectedRegionId: string | null;
		validTargetIds: Set<string>;
		continentBorderRegions: Set<string>;
		controlledBy: { ownerId: string; bonusTroops: number; continentName: string } | null;
		currentPhase: PhaseType | null;
		sourceRegionId: string | null;
		myUserId: string | null;
		onRegionClick: (regionId: string, event: MouseEvent | KeyboardEvent) => void;
	}

	let {
		continent,
		layers,
		regionMap,
		playerColors,
		selectedRegionId,
		validTargetIds,
		continentBorderRegions,
		controlledBy,
		currentPhase,
		sourceRegionId,
		myUserId,
		onRegionClick
	}: Props = $props();

	// Compute bounding box center for the continent label overlay
	let groupEl = $state<SVGGElement | null>(null);
	let labelCenter = $state({ x: 0, y: 0 });

	$effect(() => {
		if (groupEl && controlledBy) {
			const bbox = groupEl.getBBox();
			labelCenter = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
		}
	});

	const controlColor = $derived(
		controlledBy ? (playerColors.get(controlledBy.ownerId) ?? '#666') : '#666'
	);
</script>

<g class="continent" data-continent={continent.id} bind:this={groupEl}>
	{#each layers as layer (layer.id)}
		{@const region = regionMap.get(layer.id)}
		{@const color = region ? (playerColors.get(region.ownerId) ?? '#666') : '#666'}
		<Region
			{layer}
			{region}
			playerColor={color}
			selected={selectedRegionId === layer.id}
			validTarget={validTargetIds.has(layer.id)}
			hasContinentBorder={continentBorderRegions.has(layer.id)}
			{currentPhase}
			{sourceRegionId}
			{regionMap}
			isMyRegion={region?.ownerId === myUserId}
			onclick={onRegionClick}
		/>
	{/each}

	<!-- Continent control label overlay -->
	{#if controlledBy && labelCenter.x !== 0}
		<g class="continent-label" pointer-events="none">
			<rect
				x={labelCenter.x - 40}
				y={labelCenter.y - 10}
				width="80"
				height="20"
				rx="6"
				fill={controlColor}
				fill-opacity="0.3"
				stroke={controlColor}
				stroke-width="0.5"
				stroke-opacity="0.5"
			/>
			<text
				x={labelCenter.x}
				y={labelCenter.y + 1}
				text-anchor="middle"
				dominant-baseline="central"
				fill="white"
				font-size="7"
				font-weight="700"
				font-family="Inter, sans-serif"
				stroke="rgba(0,0,0,0.6)"
				stroke-width="2"
				paint-order="stroke"
			>
				{controlledBy.continentName} +{controlledBy.bonusTroops}
			</text>
		</g>
	{/if}
</g>
