<script lang="ts">
	import type { LobbySummary } from '$lib/types/lobby';
	import LobbyCard from './LobbyCard.svelte';

	interface Props {
		lobbies: LobbySummary[];
		onJoin: (lobbyId: string) => void;
	}

	let { lobbies, onJoin }: Props = $props();
</script>

{#if lobbies.length === 0}
	<div class="py-12 text-center text-gray-500">
		<p class="mb-2 text-lg">No lobbies available</p>
		<p class="text-sm">Create one to get started!</p>
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each lobbies as lobby (lobby.id)}
			<LobbyCard {lobby} {onJoin} />
		{/each}
	</div>
{/if}
