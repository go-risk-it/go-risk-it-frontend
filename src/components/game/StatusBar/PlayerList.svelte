<script lang="ts">
	import type { PlayerState } from '$lib/types/game';
	import { getPlayerHexColor } from '$lib/utils/colors';

	interface Props {
		players: PlayerState[];
		currentTurn: number;
		myUserId: string | null;
	}

	let { players, currentTurn, myUserId }: Props = $props();

	const currentPlayerIndex = $derived(currentTurn % players.length);
</script>

<div class="flex flex-col gap-2">
	{#each players as player (player.userId)}
		{@const isCurrent = player.index === currentPlayerIndex}
		{@const isMe = player.userId === myUserId}
		{@const isDead = player.status === 'dead'}
		<div
			class="flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200"
			class:glass={isCurrent}
			class:opacity-40={isDead}
		>
			{#if isDead}
				<span class="flex h-3 w-3 items-center justify-center text-xs">&#128128;</span>
			{:else}
				<div
					class="h-3 w-3 rounded-full transition-shadow duration-300"
					style="background-color: {getPlayerHexColor(player.index)}"
					class:player-glow={isCurrent}
				></div>
			{/if}
			<span class="flex-1 truncate text-sm" class:font-bold={isCurrent} class:line-through={isDead}>
				{player.name}
				{#if isMe}
					<span class="text-xs text-gray-400">(you)</span>
				{/if}
			</span>
			<span class="text-xs text-gray-400">{player.cardCount} cards</span>
			{#if !isDead}
				{#if player.connectionStatus === 'disconnected'}
					<span
						class="h-2 w-2 rounded-full bg-red-500"
						title="{player.name} disconnected"
						role="status"
						aria-label="{player.name} disconnected"
					></span>
				{:else}
					<span
						class="h-2 w-2 rounded-full bg-green-500"
						title="{player.name} connected"
						role="status"
						aria-label="{player.name} connected"
					></span>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.player-glow {
		box-shadow: 0 0 6px 2px currentColor;
	}
</style>
