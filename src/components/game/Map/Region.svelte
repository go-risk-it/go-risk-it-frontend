<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import type { Region } from '$lib/types/game';
	import type { MapLayer } from '$lib/types/map';

	interface Props {
		layer: MapLayer;
		region: Region | undefined;
		playerColor: string;
		selected: boolean;
		validTarget: boolean;
		isMyRegion: boolean;
		onclick: (regionId: string) => void;
	}

	let { layer, region, playerColor, selected, validTarget, isMyRegion, onclick }: Props = $props();

	const troops = $derived(region?.troops ?? 0);
	const regionName = $derived(layer.name);

	// Tweened troop display for smooth count animation
	const displayTroops = tweened(0, { duration: 300, easing: cubicOut });

	$effect(() => {
		displayTroops.set(troops);
	});

	// Track owner changes for flash animation
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

	// Compute center from the path for troop label placement
	let pathEl = $state<SVGPathElement | null>(null);
	let center = $state({ x: 0, y: 0 });

	$effect(() => {
		if (pathEl) {
			const bbox = pathEl.getBBox();
			center = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
		}
	});

	let hovered = $state(false);
</script>

<g
	class="region"
	class:selected
	class:valid-target={validTarget}
	class:clickable={isMyRegion || validTarget}
	class:flash={flashActive}
	role="button"
	tabindex="0"
	data-testid="region-{layer.id}"
	onclick={() => onclick(layer.id)}
	onkeydown={(e) => e.key === 'Enter' && onclick(layer.id)}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	<path
		bind:this={pathEl}
		d={layer.d}
		fill={playerColor}
		fill-opacity={selected ? 0.9 : 0.6}
		stroke={selected ? '#fff' : validTarget ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
		stroke-width={selected ? 1.5 : validTarget ? 1.2 : 0.5}
	/>

	{#if troops > 0 && center.x !== 0}
		<circle
			cx={center.x}
			cy={center.y}
			r="8"
			fill="rgba(0,0,0,0.7)"
			stroke={playerColor}
			stroke-width="1"
		/>
		<text
			x={center.x}
			y={center.y}
			text-anchor="middle"
			dominant-baseline="central"
			fill="white"
			font-size="7"
			font-weight="600"
			font-family="Inter, sans-serif"
		>
			{Math.round($displayTroops)}
		</text>
	{/if}

	<!-- Tooltip on hover -->
	{#if hovered && center.x !== 0}
		<g class="tooltip" pointer-events="none">
			<rect
				x={center.x - 40}
				y={center.y - 24}
				width="80"
				height="16"
				rx="3"
				fill="rgba(0,0,0,0.85)"
			/>
			<text
				x={center.x}
				y={center.y - 14}
				text-anchor="middle"
				dominant-baseline="central"
				fill="white"
				font-size="5"
				font-family="Inter, sans-serif"
			>
				{regionName}
			</text>
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
			stroke-width 0.15s;
	}
	.region.clickable:hover path {
		fill-opacity: 0.8;
		stroke: rgba(255, 255, 255, 0.5);
		stroke-width: 1;
	}
	.region.valid-target path {
		animation: pulse-target 1.5s ease-in-out infinite;
	}
	.region.flash path {
		animation: capture-flash 0.6s ease-out;
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
		animation: tooltip-fade 0.15s ease-out forwards;
	}
	@keyframes tooltip-fade {
		to {
			opacity: 1;
		}
	}
</style>
