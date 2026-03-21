<script lang="ts">
	/**
	 * Full-screen modal overlay displayed when the game ends. Shows a victory or
	 * defeat message with staggered fade-in animations, optional end-game stats
	 * (territories, troops, cards, turns), and a link back to the lobby.
	 * Implements a focus trap to keep keyboard navigation within the overlay.
	 */
	import { fade, scale } from 'svelte/transition';

	interface GameStats {
		territories: number;
		totalTroops: number;
		cardsHeld: number;
		turnsPlayed: number;
	}

	interface Props {
		won: boolean;
		playerName: string;
		stats?: GameStats | null;
	}

	let { won, playerName, stats = null }: Props = $props();

	let lobbyLink = $state<HTMLAnchorElement | null>(null);

	// Auto-focus the lobby link on mount so the player can press Enter to exit
	$effect(() => {
		if (lobbyLink) {
			lobbyLink.focus();
		}
	});

	/** Trap Tab key to keep focus within the overlay (single focusable element). */
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			// Only one focusable element, keep focus here
			e.preventDefault();
			lobbyLink?.focus();
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center"
	transition:fade={{ duration: 300 }}
	role="dialog"
	aria-modal="true"
	aria-label={won ? 'Victory' : 'Defeat'}
	tabindex="-1"
	onkeydown={handleKeydown}
>
	<div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
	<div class="relative text-center">
		{#if won}
			<div class="mb-4 text-6xl" in:scale={{ duration: 400, start: 0.5 }}>&#127942;</div>
			<h2
				data-testid="game-over-result"
				class="mb-2 text-4xl font-bold text-green-400"
				in:fade={{ delay: 200 }}
			>
				Victory!
			</h2>
			<p class="text-lg text-gray-300" in:fade={{ delay: 300 }}>You conquered the world!</p>
		{:else}
			<div class="mb-4 text-6xl" in:scale={{ duration: 400, start: 0.5 }}>&#128128;</div>
			<h2
				data-testid="game-over-result"
				class="mb-2 text-4xl font-bold text-red-400"
				in:fade={{ delay: 200 }}
			>
				Defeated
			</h2>
			<p class="text-lg text-gray-300" in:fade={{ delay: 300 }}>
				<span class="font-semibold">{playerName}</span> won the game
			</p>
		{/if}

		{#if stats}
			<div class="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
				<div class="rounded-lg bg-white/10 px-3 py-2" in:fade={{ delay: 400 }}>
					<div class="text-lg font-bold">{stats.territories}</div>
					<div class="text-xs text-gray-400">Territories</div>
				</div>
				<div class="rounded-lg bg-white/10 px-3 py-2" in:fade={{ delay: 500 }}>
					<div class="text-lg font-bold">{stats.totalTroops}</div>
					<div class="text-xs text-gray-400">Total Troops</div>
				</div>
				<div class="rounded-lg bg-white/10 px-3 py-2" in:fade={{ delay: 600 }}>
					<div class="text-lg font-bold">{stats.cardsHeld}</div>
					<div class="text-xs text-gray-400">Cards Held</div>
				</div>
				<div class="rounded-lg bg-white/10 px-3 py-2" in:fade={{ delay: 700 }}>
					<div class="text-lg font-bold">{stats.turnsPlayed}</div>
					<div class="text-xs text-gray-400">Turns Played</div>
				</div>
			</div>
		{/if}

		<a
			bind:this={lobbyLink}
			href="/"
			data-testid="back-to-lobby"
			class="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-semibold transition-colors hover:bg-accent-light"
		>
			Back to Lobby
		</a>
	</div>
</div>
