<script lang="ts">
	/**
	 * Interactive SVG game map with touch pan/zoom and mouse wheel zoom support.
	 * Groups map layers by continent and delegates region rendering to Continent components.
	 * Scale is clamped to [0.5, 4] to prevent over-zoom; a reset button appears when
	 * the view is transformed.
	 */
	import type { Region } from '$lib/types/game';
	import type { PhaseType } from '$lib/types/game';
	import type { MapLayer, MapLink, Continent as ContinentType } from '$lib/types/map';
	import Continent from './Continent.svelte';

	interface Props {
		viewBox: string;
		continents: ContinentType[];
		layers: MapLayer[];
		links: MapLink[];
		regionMap: Map<string, Region>;
		playerColors: Map<string, string>;
		selectedRegionId: string | null;
		validTargetIds: Set<string>;
		continentBorderRegions: Set<string>;
		controlledContinents: Map<string, { ownerId: string; bonusTroops: number; continentName: string }>;
		currentPhase: PhaseType | null;
		sourceRegionId: string | null;
		targetRegionId: string | null;
		myUserId: string | null;
		onRegionClick: (regionId: string, event: MouseEvent | KeyboardEvent) => void;
	}

	let {
		viewBox,
		continents,
		layers,
		links,
		regionMap,
		playerColors,
		selectedRegionId,
		validTargetIds,
		continentBorderRegions,
		controlledContinents,
		currentPhase,
		sourceRegionId,
		targetRegionId,
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

	// Compute region centers from SVG path bounding boxes after mount
	let svgEl = $state<SVGSVGElement | null>(null);
	let regionCenters = $state(new Map<string, { x: number; y: number }>());

	$effect(() => {
		if (!svgEl) return;
		// Wait one frame for paths to be rendered
		requestAnimationFrame(() => {
			const centers = new Map<string, { x: number; y: number }>();
			const paths = svgEl!.querySelectorAll<SVGPathElement>('path[d]');
			for (const path of paths) {
				const regionGroup = path.closest('[data-testid]');
				if (!regionGroup) continue;
				const testId = regionGroup.getAttribute('data-testid') ?? '';
				const regionId = testId.replace('region-', '');
				if (regionId) {
					const bbox = path.getBBox();
					centers.set(regionId, { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 });
				}
			}
			regionCenters = centers;
		});
	});

	// Cross-ocean links: links where region centers are far apart
	const DISTANCE_THRESHOLD = 200;
	const longDistanceLinks = $derived.by(() => {
		if (regionCenters.size === 0) return [];
		return links.filter((link) => {
			const a = regionCenters.get(link.source);
			const b = regionCenters.get(link.target);
			if (!a || !b) return false;
			const dist = Math.hypot(a.x - b.x, a.y - b.y);
			return dist > DISTANCE_THRESHOLD;
		});
	});

	// Reinforce connection path: line between source and target during reinforce
	const reinforcePath = $derived.by(() => {
		if (currentPhase !== 'reinforce' || !sourceRegionId || !targetRegionId) return null;
		const from = regionCenters.get(sourceRegionId);
		const to = regionCenters.get(targetRegionId);
		if (!from || !to) return null;
		// Compute arrow head
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const len = Math.hypot(dx, dy);
		if (len === 0) return null;
		const ux = dx / len;
		const uy = dy / len;
		const ax = to.x - ux * 8;
		const ay = to.y - uy * 8;
		const arrowPoints = `${to.x},${to.y} ${ax - uy * 4},${ay + ux * 4} ${ax + uy * 4},${ay - ux * 4}`;
		return { from, to, arrowPoints };
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
		bind:this={svgEl}
		{viewBox}
		class="h-full w-full"
		preserveAspectRatio="xMidYMid meet"
		xmlns="http://www.w3.org/2000/svg"
		style="transform: translate({translateX}px, {translateY}px) scale({scale}); transform-origin: center;"
	>
		<!-- Cross-ocean connection lines (below regions) -->
		<g class="connection-lines" pointer-events="none">
			{#each longDistanceLinks as link (link.source + '-' + link.target)}
				{@const a = regionCenters.get(link.source)}
				{@const b = regionCenters.get(link.target)}
				{#if a && b}
					<line
						x1={a.x}
						y1={a.y}
						x2={b.x}
						y2={b.y}
						stroke="rgba(255,255,255,0.25)"
						stroke-width="1"
						stroke-dasharray="4,4"
					/>
				{/if}
			{/each}
		</g>

		{#each continents as continent (continent.id)}
			<Continent
				{continent}
				layers={layersByContinent.get(continent.id) ?? []}
				{regionMap}
				{playerColors}
				{selectedRegionId}
				{validTargetIds}
				{continentBorderRegions}
				controlledBy={controlledContinents.get(continent.id) ?? null}
				{currentPhase}
				{sourceRegionId}
				{myUserId}
				{onRegionClick}
			/>
		{/each}

		<!-- Reinforce connection path (above regions) -->
		{#if reinforcePath}
			<g class="reinforce-path" pointer-events="none">
				<line
					x1={reinforcePath.from.x}
					y1={reinforcePath.from.y}
					x2={reinforcePath.to.x}
					y2={reinforcePath.to.y}
					stroke="#4ade80"
					stroke-width="2"
					stroke-dasharray="6,4"
					stroke-linecap="round"
					opacity="0.7"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="-20"
						dur="1s"
						repeatCount="indefinite"
					/>
				</line>
				<polygon
					points={reinforcePath.arrowPoints}
					fill="#4ade80"
					opacity="0.7"
				/>
			</g>
		{/if}
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
