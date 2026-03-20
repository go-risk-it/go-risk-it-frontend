<script lang="ts">
	import type { Region as RegionType } from '$lib/types/game';
	import type { MapLayer, Continent as ContinentType } from '$lib/types/map';
	import Region from './Region.svelte';

	interface Props {
		continent: ContinentType;
		layers: MapLayer[];
		regionMap: Map<string, RegionType>;
		playerColors: Map<string, string>;
		selectedRegionId: string | null;
		validTargetIds: Set<string>;
		myUserId: string | null;
		onRegionClick: (regionId: string) => void;
	}

	let {
		continent,
		layers,
		regionMap,
		playerColors,
		selectedRegionId,
		validTargetIds,
		myUserId,
		onRegionClick
	}: Props = $props();
</script>

<g class="continent" data-continent={continent.id}>
	{#each layers as layer (layer.id)}
		{@const region = regionMap.get(layer.id)}
		{@const color = region ? (playerColors.get(region.ownerId) ?? '#666') : '#666'}
		<Region
			{layer}
			{region}
			playerColor={color}
			selected={selectedRegionId === layer.id}
			validTarget={validTargetIds.has(layer.id)}
			isMyRegion={region?.ownerId === myUserId}
			onclick={onRegionClick}
		/>
	{/each}
</g>
