<script lang="ts">
	/**
	 * Displays a single lobby as a card showing the owner's name, current participant list,
	 * and a join button. Used within LobbyList to represent each available game lobby.
	 */
	import type { LobbySummary } from '$lib/types/lobby';

	interface Props {
		lobby: LobbySummary;
		onJoin: (lobbyId: string) => void;
	}

	let { lobby, onJoin }: Props = $props();
</script>

<div class="glass rounded-xl p-4 transition-all hover:border-accent/30">
	<div class="mb-2 flex items-center justify-between">
		<h3 class="font-semibold">{lobby.owner}'s game</h3>
		<span class="rounded-full bg-surface-600 px-2 py-0.5 text-xs">
			{lobby.participants.length} players
		</span>
	</div>

	<div class="mb-3 flex flex-wrap gap-1">
		{#each lobby.participants as participant}
			<span class="rounded bg-surface-700 px-2 py-0.5 text-xs text-gray-300">
				{participant.name}
			</span>
		{/each}
	</div>

	<button
		onclick={() => onJoin(lobby.id)}
		data-testid="join-lobby-btn"
		class="w-full cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold transition-colors hover:bg-accent-light"
	>
		Join
	</button>
</div>
