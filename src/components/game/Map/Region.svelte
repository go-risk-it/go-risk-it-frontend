<script lang="ts">
	/**
	 * Renders a single map region as an SVG path with a troop count badge and hover tooltip.
	 * Uses a tweened store for smooth troop count transitions and triggers a flash animation
	 * when the region changes ownership (e.g., after a successful attack).
	 * Supports phase-aware styling: attack targets glow red/orange, reinforce targets glow green,
	 * and non-interactive regions dim when a source is selected.
	 */
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import type { Region } from '$lib/types/game';
	import type { PhaseType } from '$lib/types/game';
	import type { MapLayer } from '$lib/types/map';

	interface Props {
		layer: MapLayer;
		region: Region | undefined;
		playerColor: string;
		selected: boolean;
		validTarget: boolean;
		hasContinentBorder: boolean;
		currentPhase: PhaseType | null;
		sourceRegionId: string | null;
		regionMap: Map<string, Region>;
		isMyRegion: boolean;
		onclick: (regionId: string, event: MouseEvent | KeyboardEvent) => void;
	}

	let {
		layer,
		region,
		playerColor,
		selected,
		validTarget,
		hasContinentBorder,
		currentPhase,
		sourceRegionId,
		regionMap,
		isMyRegion,
		onclick
	}: Props = $props();

	const troops = $derived(region?.troops ?? 0);
	const regionName = $derived(layer.name);

	// Dynamic badge sizing based on troop count
	const badgeRadius = $derived(troops >= 10 ? 13 : troops > 5 ? 12 : 11);
	const badgeFontSize = $derived(troops >= 10 ? 10 : 11);

	// Animated troop count — interpolates between old and new values over 300ms
	const displayTroops = tweened(0, { duration: 300, easing: cubicOut });

	$effect(() => {
		displayTroops.set(troops);
	});

	// Detect ownership changes to trigger a brief white flash (capture-flash CSS animation)
	const currentOwnerId = $derived(region?.ownerId ?? '');
	let previousOwnerId = $state('');
	let flashActive = $state(false);

	$effect(() => {
		if (previousOwnerId && currentOwnerId && currentOwnerId !== previousOwnerId) {
			flashActive = true;
			setTimeout(() => (flashActive = false), 600);
		}
		previousOwnerId = currentOwnerId;
	});

	// Derive label center from the SVG path's bounding box
	let pathEl = $state<SVGPathElement | null>(null);
	let center = $state({ x: 0, y: 0 });

	$effect(() => {
		if (pathEl) {
			const bbox = pathEl.getBBox();
			center = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
		}
	});

	let hovered = $state(false);

	// Whether a source is selected (targets are being shown) — used for dimming
	const hasActiveSource = $derived(
		(currentPhase === 'attack' || currentPhase === 'reinforce') && sourceRegionId !== null
	);

	// Dim non-interactive regions when a source is selected
	const dimmed = $derived(hasActiveSource && !selected && !validTarget && !isMyRegion);

	// Phase-aware valid-target stroke color
	const targetStrokeColor = $derived(currentPhase === 'reinforce' ? '#4ade80' : '#f97316');

	// Troop comparison tooltip for attack targets
	const sourceRegion = $derived(sourceRegionId ? regionMap.get(sourceRegionId) : null);
	const showComparison = $derived(
		hovered && validTarget && currentPhase === 'attack' && sourceRegion && region
	);
</script>

<g
	class="region"
	class:selected
	class:valid-target={validTarget}
	class:valid-target-attack={validTarget && currentPhase === 'attack'}
	class:valid-target-reinforce={validTarget && currentPhase === 'reinforce'}
	class:clickable={isMyRegion || validTarget}
	class:flash={flashActive}
	class:dimmed
	role="button"
	tabindex="0"
	data-testid="region-{layer.id}"
	onclick={(e) => onclick(layer.id, e)}
	onkeydown={(e) => e.key === 'Enter' && onclick(layer.id, e)}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	<path
		bind:this={pathEl}
		d={layer.d}
		fill={playerColor}
		fill-opacity={selected ? 0.9 : dimmed ? 0.25 : 0.6}
		stroke={selected
			? '#fff'
			: validTarget
				? targetStrokeColor
				: hasContinentBorder
					? 'rgba(255,255,255,0.35)'
					: 'rgba(255,255,255,0.15)'}
		stroke-width={selected ? 1.5 : validTarget ? 1.5 : hasContinentBorder ? 1.5 : 0.5}
	/>

	{#if troops > 0 && center.x !== 0}
		<circle
			cx={center.x}
			cy={center.y}
			r={badgeRadius}
			fill="rgba(0,0,0,0.7)"
			stroke={playerColor}
			stroke-width="1.5"
		/>
		<text
			x={center.x}
			y={center.y}
			text-anchor="middle"
			dominant-baseline="central"
			fill="white"
			font-size={badgeFontSize}
			font-weight="600"
			font-family="Inter, sans-serif"
			stroke="rgba(0,0,0,0.8)"
			stroke-width="2.5"
			paint-order="stroke"
		>
			{Math.round($displayTroops)}
		</text>
	{/if}

	<!-- Tooltip on hover -->
	{#if hovered && center.x !== 0}
		<g class="tooltip" pointer-events="none">
			{#if showComparison}
				<!-- Attack target tooltip: action hint + troop comparison -->
				<rect
					x={center.x - 55}
					y={center.y - 42}
					width="110"
					height="36"
					rx="4"
					fill="rgba(0,0,0,0.9)"
				/>
				<text
					x={center.x}
					y={center.y - 33}
					text-anchor="middle"
					dominant-baseline="central"
					fill="white"
					font-size="7"
					font-family="Inter, sans-serif"
				>
					Click to attack · Shift to blitz
				</text>
				<text
					x={center.x}
					y={center.y - 22}
					text-anchor="middle"
					dominant-baseline="central"
					fill="#fbbf24"
					font-size="8"
					font-weight="600"
					font-family="Inter, sans-serif"
				>
					Your {sourceRegion?.troops} vs Their {region?.troops}
				</text>
			{:else}
				<rect
					x={center.x - 50}
					y={center.y - 26}
					width="100"
					height="18"
					rx="4"
					fill="rgba(0,0,0,0.9)"
				/>
				<text
					x={center.x}
					y={center.y - 15}
					text-anchor="middle"
					dominant-baseline="central"
					fill="white"
					font-size="8"
					font-family="Inter, sans-serif"
				>
					{regionName}
				</text>
			{/if}
		</g>
	{/if}
</g>

<style>
	.region {
		cursor: default;
		outline: none;
	}
	.region.clickable {
		cursor: pointer;
	}
	.region path {
		transition:
			fill 0.3s,
			fill-opacity 0.15s,
			stroke 0.15s,
			stroke-width 0.15s,
			filter 0.15s;
	}
	.region:focus-visible path {
		stroke: var(--color-accent);
		stroke-width: 2;
	}
	.region.clickable:hover path {
		fill-opacity: 0.8;
		stroke: rgba(255, 255, 255, 0.5);
		stroke-width: 1;
	}
	/* Attack target: orange/red glow */
	.region.valid-target-attack path {
		animation: pulse-attack 1.5s ease-in-out infinite;
		filter: drop-shadow(0 0 3px rgba(249, 115, 22, 0.6));
	}
	/* Reinforce target: green glow */
	.region.valid-target-reinforce path {
		animation: pulse-reinforce 1.5s ease-in-out infinite;
		filter: drop-shadow(0 0 3px rgba(74, 222, 128, 0.6));
	}
	/* Fallback for valid-target without phase class */
	.region.valid-target:not(.valid-target-attack):not(.valid-target-reinforce) path {
		animation: pulse-target 1.5s ease-in-out infinite;
	}
	.region.flash path {
		animation: capture-flash 0.6s ease-out;
	}
	.region.dimmed path {
		filter: saturate(0.3);
	}
	@keyframes pulse-attack {
		0%,
		100% {
			fill-opacity: 0.55;
		}
		50% {
			fill-opacity: 0.85;
		}
	}
	@keyframes pulse-reinforce {
		0%,
		100% {
			fill-opacity: 0.55;
		}
		50% {
			fill-opacity: 0.85;
		}
	}
	@keyframes pulse-target {
		0%,
		100% {
			fill-opacity: 0.6;
		}
		50% {
			fill-opacity: 0.8;
		}
	}
	@keyframes capture-flash {
		0% {
			fill: white;
			fill-opacity: 1;
		}
		100% {
			fill-opacity: 0.6;
		}
	}
	.tooltip {
		opacity: 0;
		animation: tooltip-fade 0.15s ease-out 0.2s forwards;
	}
	@keyframes tooltip-fade {
		to {
			opacity: 1;
		}
	}
</style>
