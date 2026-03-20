<script lang="ts">
	import { goto } from '$app/navigation';
	import { createLobbyWebSocket } from '$lib/state/lobby-state.svelte';
	import { startLobby, getGames } from '$lib/api/lobby';
	import { getAuth } from '$lib/state/auth.svelte';

	interface Props {
		lobbyId: string;
		isOwner: boolean;
		onLeave: () => void;
	}

	const { lobbyId, isOwner, onLeave }: Props = $props();

	const auth = getAuth();
	// svelte-ignore state_referenced_locally
	const lobbyWs = createLobbyWebSocket(lobbyId);

	let error = $state('');
	let starting = $state(false);

	$effect(() => {
		lobbyWs.connect();
		return () => lobbyWs.disconnect();
	});

	const participants = $derived(lobbyWs.lobbyState?.participants ?? []);
	const canStart = $derived(isOwner && participants.length >= 3);

	async function handleStart() {
		error = '';
		starting = true;
		try {
			await startLobby(lobbyId);
			// Start returns no body — fetch the game ID from games summary
			const games = await getGames();
			if (games && games.length > 0) {
				goto(`/game/${games[0].id}`);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start game';
		} finally {
			starting = false;
		}
	}
</script>

<div class="glass mx-auto max-w-md rounded-2xl p-6">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-bold">Waiting Room</h2>
		<span
			class="h-2 w-2 rounded-full"
			class:bg-green-500={lobbyWs.connected}
			class:bg-red-500={!lobbyWs.connected}
		></span>
	</div>

	<div class="mb-6 space-y-2">
		{#each participants as participant, i}
			<div
				class="flex items-center gap-3 rounded-lg bg-surface-700/50 px-4 py-2.5"
				data-testid="participant-{participant.name}"
			>
				<span class="flex h-6 w-6 items-center justify-center rounded-full bg-surface-500 text-xs">
					{i + 1}
				</span>
				<span class="font-medium">
					{participant.name}
					{#if participant.userId === auth.user?.id}
						<span class="text-xs text-gray-400">(you)</span>
					{/if}
				</span>
			</div>
		{/each}

		{#if participants.length < 3}
			<div class="rounded-lg border border-dashed border-gray-600 px-4 py-2.5 text-center text-sm text-gray-500">
				Waiting for players... ({3 - participants.length} more needed)
			</div>
		{/if}
	</div>

	{#if error}
		<div class="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
	{/if}

	<div class="flex gap-3">
		<button
			onclick={onLeave}
			class="flex-1 cursor-pointer rounded-lg bg-surface-600 py-2.5 text-sm transition-colors hover:bg-surface-500"
		>
			Leave
		</button>

		{#if isOwner}
			<button
				onclick={handleStart}
				disabled={!canStart || starting}
				data-testid="start-game-btn"
				class="flex-1 cursor-pointer rounded-lg bg-accent py-2.5 text-sm font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
			>
				{#if starting}
					Starting...
				{:else if !canStart}
					Need {3 - participants.length} more
				{:else}
					Start Game
				{/if}
			</button>
		{/if}
	</div>
</div>
