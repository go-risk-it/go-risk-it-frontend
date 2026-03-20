<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		won: boolean;
		playerName: string;
	}

	let { won, playerName }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center"
	transition:fade={{ duration: 300 }}
>
	<div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
	<div class="relative text-center">
		{#if won}
			<div class="mb-4 text-6xl">&#127942;</div>
			<h2 data-testid="game-over-result" class="mb-2 text-4xl font-bold text-green-400">Victory!</h2>
			<p class="text-lg text-gray-300">You conquered the world!</p>
		{:else}
			<div class="mb-4 text-6xl">&#128128;</div>
			<h2 data-testid="game-over-result" class="mb-2 text-4xl font-bold text-red-400">Defeated</h2>
			<p class="text-lg text-gray-300"><span class="font-semibold">{playerName}</span> won the game</p>
		{/if}
		<a
			href="/"
			data-testid="back-to-lobby"
			class="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-semibold transition-colors hover:bg-accent-light"
		>
			Back to Lobby
		</a>
	</div>
</div>
