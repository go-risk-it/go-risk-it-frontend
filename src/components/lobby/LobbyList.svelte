<script lang="ts">
	/**
	 * Renders a grid of available lobbies as cards, or an empty state with a create button
	 * when no lobbies exist. Delegates individual lobby display to LobbyCard and lobby
	 * join/create actions to parent callbacks.
	 */
	import type { LobbySummary } from '$lib/types/lobby';
	import LobbyCard from './LobbyCard.svelte';

	interface Props {
		lobbies: LobbySummary[];
		onJoin: (lobbyId: string) => void;
		onCreate?: () => void;
	}

	let { lobbies, onJoin, onCreate }: Props = $props();
</script>

{#if lobbies.length === 0}
	<div class="py-12 text-center text-gray-500">
		<p class="mb-2 text-lg">No lobbies available</p>
		<p class="mb-4 text-sm">Create one to get started!</p>
		{#if onCreate}
			<button
				onclick={onCreate}
				class="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-light"
			>
				Create Lobby
			</button>
		{/if}
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each lobbies as lobby (lobby.id)}
			<LobbyCard {lobby} {onJoin} />
		{/each}
	</div>
{/if}
