<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuth } from '$lib/state/auth.svelte';
	import { getLobbies, getGames, createLobby, joinLobby } from '$lib/api/lobby';
	import LobbyList from '../components/lobby/LobbyList.svelte';
	import WaitingRoom from '../components/lobby/WaitingRoom.svelte';
	import type { LobbySummary, GameSummary } from '$lib/types/lobby';

	const auth = getAuth();

	let tab = $state<'lobbies' | 'games'>('lobbies');
	let lobbies = $state<LobbySummary[]>([]);
	let games = $state<GameSummary[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Waiting room state
	let inLobbyId = $state<string | null>(null);
	let isLobbyOwner = $state(false);

	// Create lobby state
	let playerName = $state('');
	let showCreateForm = $state(false);

	$effect(() => {
		if (!auth.loading && !auth.isAuthenticated) {
			goto('/auth/signin');
		}
	});

	$effect(() => {
		if (auth.isAuthenticated) {
			loadData();
		}
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [lobbyData, gameData] = await Promise.all([getLobbies(), getGames()]);
			lobbies = lobbyData ?? [];
			games = gameData ?? [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	async function handleCreateLobby() {
		if (!playerName.trim()) return;
		error = '';
		try {
			const result = (await createLobby(playerName.trim())) as { lobbyId?: number };
			if (result?.lobbyId) {
				inLobbyId = String(result.lobbyId);
				isLobbyOwner = true;
				showCreateForm = false;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create lobby';
		}
	}

	async function handleJoinLobby(lobbyId: string) {
		if (!playerName.trim()) {
			showCreateForm = true;
			error = 'Enter your name first';
			const input = document.querySelector<HTMLInputElement>('[data-testid="player-name-input"]');
			if (input) {
				input.focus();
				input.classList.add('ring-2', 'ring-red-400');
				input.addEventListener('input', () => input.classList.remove('ring-2', 'ring-red-400'), { once: true });
			}
			return;
		}
		error = '';
		try {
			await joinLobby(lobbyId, playerName.trim());
			inLobbyId = lobbyId;
			isLobbyOwner = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to join lobby';
		}
	}

	function handleLeaveLobby() {
		inLobbyId = null;
		isLobbyOwner = false;
		loadData();
	}
</script>

{#if auth.loading}
	<div class="flex min-h-dvh items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent">
		</div>
	</div>
{:else if !auth.isAuthenticated}
	<!-- Will redirect -->
{:else if inLobbyId}
	<div class="flex min-h-dvh flex-col">
		<header class="glass flex items-center justify-between px-6 py-3">
			<h1 class="text-xl font-bold tracking-tight">
				<button onclick={handleLeaveLobby} class="cursor-pointer hover:text-accent-light transition-colors">Risk</button>
			</h1>
			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-400">{auth.user?.email}</span>
				<button
					onclick={() => auth.signOut()}
					data-testid="signout-btn"
					class="cursor-pointer rounded-lg bg-surface-600 px-3 py-1.5 text-sm transition-colors hover:bg-surface-500"
				>
					Sign Out
				</button>
			</div>
		</header>
		<main class="flex flex-1 items-center justify-center p-6">
			<WaitingRoom lobbyId={inLobbyId} isOwner={isLobbyOwner} onLeave={handleLeaveLobby} />
		</main>
	</div>
{:else}
	<div class="flex min-h-dvh flex-col">
		<header class="glass flex items-center justify-between px-6 py-3">
			<h1 class="text-xl font-bold tracking-tight">Risk</h1>
			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-400">{auth.user?.email}</span>
				<button
					onclick={() => auth.signOut()}
					data-testid="signout-btn"
					class="cursor-pointer rounded-lg bg-surface-600 px-3 py-1.5 text-sm transition-colors hover:bg-surface-500"
				>
					Sign Out
				</button>
			</div>
		</header>

		<main class="flex-1 p-6">
			{#if error}
				<div class="mx-auto mb-4 max-w-2xl rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
					{error}
				</div>
			{/if}

			<!-- Player name + create -->
			<div class="mx-auto mb-6 flex max-w-2xl items-center gap-3">
				<input
					type="text"
					bind:value={playerName}
					placeholder="Your player name" maxlength="20"
					data-testid="player-name-input"
					class="flex-1 rounded-lg bg-surface-700 px-4 py-2.5 text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-accent"
				/>
				<button
					onclick={handleCreateLobby}
					disabled={!playerName.trim()}
					data-testid="create-game-btn"
					class="cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
				>
					Create Game
				</button>
			</div>

			<!-- Tabs -->
			<div class="mx-auto mb-6 flex max-w-2xl gap-1 rounded-lg bg-surface-800 p-1">
				<button
					onclick={() => (tab = 'lobbies')}
					class="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
					class:bg-surface-600={tab === 'lobbies'}
					class:text-white={tab === 'lobbies'}
					class:text-gray-400={tab !== 'lobbies'}
				>
					Lobbies
				</button>
				<button
					onclick={() => (tab = 'games')}
					class="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
					class:bg-surface-600={tab === 'games'}
					class:text-white={tab === 'games'}
					class:text-gray-400={tab !== 'games'}
				>
					My Games
				</button>
			</div>

			<!-- Content -->
			<div class="mx-auto max-w-2xl">
				{#if loading}
					<div class="flex justify-center py-12">
						<div
							class="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"
						></div>
					</div>
				{:else if tab === 'lobbies'}
					<LobbyList {lobbies} onJoin={handleJoinLobby} onCreate={() => {
						const input = document.querySelector<HTMLInputElement>('[data-testid="player-name-input"]');
						if (input) input.focus();
					}} />
				{:else}
					{#if games.length === 0}
						<div class="py-12 text-center text-gray-500">
							<p class="mb-2 text-lg">No active games</p>
							<p class="text-sm">Join or create a lobby to start playing!</p>
						</div>
					{:else}
						<div class="grid gap-3 sm:grid-cols-2">
							{#each games as game (game.id)}
								<button
									onclick={() => goto(`/game/${game.id}`)}
									class="glass cursor-pointer rounded-xl p-4 text-left transition-all hover:border-accent/30"
								>
									<div class="font-semibold">Game #{game.id}</div>
									<div class="text-sm text-gray-400">Click to rejoin</div>
								</button>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</main>
	</div>
{/if}
