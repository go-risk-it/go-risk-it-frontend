<script lang="ts">
	/**
	 * Interactive SVG game map with touch pan/zoom and mouse wheel zoom support.
	 * Groups map layers by continent and delegates region rendering to Continent components.
	 * Scale is clamped to [0.5, 4] to prevent over-zoom; a reset button appears when
	 * the view is transformed.
	 */
	import type { Region } from '$lib/types/game';
	import type { MapLayer, Continent as ContinentType } from '$lib/types/map';
	import Continent from './Continent.svelte';

	interface Props {
		viewBox: string;
		continents: ContinentType[];
		layers: MapLayer[];
		regionMap: Map<string, Region>;
		playerColors: Map<string, string>;
		selectedRegionId: string | null;
		validTargetIds: Set<string>;
		myUserId: string | null;
		onRegionClick: (regionId: string) => void;
	}

	let {
		viewBox,
		continents,
		layers,
		regionMap,
		playerColors,
		selectedRegionId,
		validTargetIds,
		myUserId,
		onRegionClick
	}: Props = $props();

	// Group layers by continent for rendering
	const layersByContinent = $derived.by(() => {
		const map = new Map<string, MapLayer[]>();
		for (const continent of continents) {
			map.set(continent.id, []);
		}
		for (const layer of layers) {
			map.get(layer.continent)?.push(layer);
		}
		return map;
	});

	// Touch pan/zoom state
	let containerEl = $state<HTMLDivElement | null>(null);
	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);
	let isPanning = $state(false);
	let lastTouch = $state<{ x: number; y: number } | null>(null);
	let lastPinchDist = $state(0);

	/** Handles single-finger pan and two-finger pinch-to-zoom. */
	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			isPanning = true;
			lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		} else if (e.touches.length === 2) {
			isPanning = false;
			lastPinchDist = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 1 && isPanning && lastTouch) {
			const dx = e.touches[0].clientX - lastTouch.x;
			const dy = e.touches[0].clientY - lastTouch.y;
			translateX += dx;
			translateY += dy;
			lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			e.preventDefault();
		} else if (e.touches.length === 2) {
			// Pinch zoom: ratio of current to previous finger distance
			const dist = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			if (lastPinchDist > 0) {
				const delta = dist / lastPinchDist;
				scale = Math.max(0.5, Math.min(4, scale * delta));
			}
			lastPinchDist = dist;
			e.preventDefault();
		}
	}

	function handleTouchEnd() {
		isPanning = false;
		lastTouch = null;
		lastPinchDist = 0;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		scale = Math.max(0.5, Math.min(4, scale * delta));
	}

	function resetView() {
		scale = 1;
		translateX = 0;
		translateY = 0;
	}
</script>

<div
	bind:this={containerEl}
	class="relative h-full w-full touch-none overflow-hidden"
	role="img"
	aria-label="Game map"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	onwheel={handleWheel}
>
	<svg
		{viewBox}
		class="h-full w-full"
		preserveAspectRatio="xMidYMid meet"
		xmlns="http://www.w3.org/2000/svg"
		style="transform: translate({translateX}px, {translateY}px) scale({scale}); transform-origin: center;"
	>
		{#each continents as continent (continent.id)}
			<Continent
				{continent}
				layers={layersByContinent.get(continent.id) ?? []}
				{regionMap}
				{playerColors}
				{selectedRegionId}
				{validTargetIds}
				{myUserId}
				{onRegionClick}
			/>
		{/each}
	</svg>

	<!-- Zoom controls -->
	{#if scale !== 1 || translateX !== 0 || translateY !== 0}
		<button
			onclick={resetView}
			class="absolute right-2 bottom-2 cursor-pointer rounded-lg bg-surface-700/80 px-2 py-1 text-xs text-gray-300 backdrop-blur-sm transition-colors hover:bg-surface-600"
		>
			Reset view
		</button>
	{/if}
</div>
