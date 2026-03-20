<script lang="ts">
	import GameMap from './Map/GameMap.svelte';
	import PhaseBar from './PhaseBar.svelte';
	import StatusBar from './StatusBar/StatusBar.svelte';
	import ActionPanel from './ActionPanel/ActionPanel.svelte';
	import GameOverOverlay from './GameOverOverlay.svelte';
	import ConnectionBanner from './ConnectionBanner.svelte';
	import { createGameState } from '$lib/state/game-state.svelte';
	import { createWebSocket } from '$lib/state/websocket.svelte';
	import { createMoveState } from '$lib/state/move-state.svelte';
	import { getMapData } from '$lib/state/map-data.svelte';
	import { getAuth } from '$lib/state/auth.svelte';
	import { buildPlayerColorMap } from '$lib/utils/colors';
	import { Graph } from '$lib/utils/graph';
	import { playTurnStart, playConquer, playVictory, playDefeat, audio } from '$lib/audio/audio.svelte';

	interface Props {
		gameId: string;
	}

	const { gameId }: Props = $props();

	const auth = getAuth();
	const mapData = getMapData();
	const game = createGameState();
	const moveState = createMoveState();

	// WebSocket is created once per component lifecycle - gameId won't change
	// because SvelteKit remounts the component on route param changes
	// svelte-ignore state_referenced_locally
	let ws = $state(createWebSocket(gameId));

	// Loading timeout — if no board state arrives in 15s, show game-not-found
	let loadTimedOut = $state(false);
	$effect(() => {
		if (game.boardState) return; // already loaded
		const timer = setTimeout(() => {
			if (!game.boardState) loadTimedOut = true;
		}, 15_000);
		return () => clearTimeout(timer);
	});

	// Load map data on mount
	$effect(() => {
		mapData.load();
	});

	// Connect WebSocket and wire to game state
	$effect(() => {
		ws.onMessage(game.handleMessage);
		ws.connect();
		return () => ws.disconnect();
	});

	// Reconnect WebSocket when auth token refreshes
	let prevToken = $state(auth.accessToken);
	$effect(() => {
		const token = auth.accessToken;
		if (prevToken && token && token !== prevToken && ws.connected) {
			ws.reconnectWithNewToken();
		}
		prevToken = token;
	});

	// Sync move state with game phase changes
	$effect(() => {
		if (game.isMyTurn && game.gameState) {
			moveState.startPhase(game.gameState.phaseType);
		} else {
			moveState.reset();
		}
	});

	// Turn notification + sound
	let prevIsMyTurn = $state(false);
	$effect(() => {
		const myTurn = game.isMyTurn;
		if (myTurn && !prevIsMyTurn) {
			playTurnStart();
			// Browser notification
			if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
				new Notification('Risk', { body: "It's your turn!" });
			}
		}
		prevIsMyTurn = myTurn;
	});

	// Request notification permission on first interaction
	$effect(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			// Ask on first turn
			if (game.isMyTurn) {
				Notification.requestPermission();
			}
		}
	});

	// Conquer phase sound
	$effect(() => {
		if (game.gameState?.phaseType === 'conquer' && game.isMyTurn) {
			playConquer();
		}
	});

	// Game over detection
	const gameOver = $derived.by(() => {
		if (!game.playersState || !auth.user) return null;
		const alivePlayers = game.playersState.players.filter((p) => p.status !== 'dead');
		if (alivePlayers.length !== 1) return null;
		const winner = alivePlayers[0];
		return {
			won: winner.userId === auth.user.id,
			winnerName: winner.name
		};
	});

	// Victory/defeat audio
	$effect(() => {
		if (gameOver?.won) playVictory();
		else if (gameOver) playDefeat();
	});

	// Game stats for the game over overlay
	const gameStats = $derived.by(() => {
		if (!gameOver || !game.boardState || !auth.user || !game.gameState) return null;
		const myRegions = game.boardState.regions.filter((r) => r.ownerId === auth.user!.id);
		const totalTroops = myRegions.reduce((sum, r) => sum + r.troops, 0);
		const turnsPlayed = Math.ceil((game.gameState.turn + 1) / (game.playersState?.players.length ?? 1));
		return {
			territories: myRegions.length,
			totalTroops,
			cardsHeld: game.cardState.cards.length,
			turnsPlayed
		};
	});

	// Build graph when board state + map data are both available
	const graph = $derived.by(() => {
		if (!game.boardState || !mapData.loaded) return null;
		return new Graph(mapData.links, game.boardState);
	});

	// Player colors
	const playerColors = $derived.by(() => {
		if (!game.playersState) return new Map<string, string>();
		return buildPlayerColorMap(game.playersState.players);
	});

	// Valid targets based on current interaction
	const validTargetIds = $derived.by(() => {
		const targets = new Set<string>();
		if (!graph || !game.boardState) return targets;
		const interaction = moveState.interaction;

		if (interaction.phase === 'attack' && interaction.sourceRegionId) {
			// Valid targets: adjacent enemy regions
			const neighbors = graph.getNeighbors(interaction.sourceRegionId);
			const sourceRegion = game.regionMap.get(interaction.sourceRegionId);
			if (sourceRegion) {
				for (const nId of neighbors) {
					const neighbor = game.regionMap.get(nId);
					if (neighbor && neighbor.ownerId !== sourceRegion.ownerId) {
						targets.add(nId);
					}
				}
			}
		} else if (interaction.phase === 'reinforce' && interaction.sourceRegionId) {
			// Valid targets: reachable friendly regions
			if (game.boardState) {
				for (const region of game.boardState.regions) {
					if (
						region.id !== interaction.sourceRegionId &&
						region.ownerId === auth.user?.id &&
						graph.canReach(interaction.sourceRegionId, region.id)
					) {
						targets.add(region.id);
					}
				}
			}
		}

		return targets;
	});

	// Selected region for highlighting
	const selectedRegionId = $derived.by(() => {
		const interaction = moveState.interaction;
		switch (interaction.phase) {
			case 'deploy':
				return interaction.regionId;
			case 'attack':
				return interaction.sourceRegionId;
			case 'reinforce':
				return interaction.sourceRegionId;
			default:
				return null;
		}
	});

	// Current player name for display
	const currentPlayerName = $derived.by(() => {
		if (!game.gameState || !game.playersState) return '';
		const idx = game.gameState.turn % game.playersState.players.length;
		return game.playersState.players[idx]?.name ?? '';
	});

	// Prevent accidental navigation away from active game
	$effect(() => {
		function handler(e: BeforeUnloadEvent) {
			if (game.gameState && !gameOver) {
				e.preventDefault();
			}
		}
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	});

	// Escape key to cancel region selection
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') moveState.reset();
	}

	function handleRegionClick(regionId: string) {
		if (!game.isMyTurn || !game.boardState) return;
		const region = game.regionMap.get(regionId);
		if (!region) return;

		const interaction = moveState.interaction;

		switch (interaction.phase) {
			case 'deploy':
				if (region.ownerId === auth.user?.id) {
					moveState.setDeployRegion(regionId);
				}
				break;

			case 'attack':
				if (!interaction.sourceRegionId) {
					// Select source: must be own region with > 1 troops
					if (region.ownerId === auth.user?.id && region.troops > 1) {
						moveState.setAttackSource(regionId);
					}
				} else if (validTargetIds.has(regionId)) {
					// Select target
					moveState.setAttackTarget(regionId);
				} else if (region.ownerId === auth.user?.id && region.troops > 1) {
					// Re-select source
					moveState.setAttackSource(regionId);
				}
				break;

			case 'reinforce':
				if (!interaction.sourceRegionId) {
					// Select source: own region with > 1 troops
					if (region.ownerId === auth.user?.id && region.troops > 1) {
						moveState.setReinforceSource(regionId);
					}
				} else if (validTargetIds.has(regionId)) {
					moveState.setReinforceTarget(regionId);
				} else if (region.ownerId === auth.user?.id && region.troops > 1) {
					moveState.setReinforceSource(regionId);
				}
				break;
		}
	}
</script>

{#if !mapData.loaded || !game.boardState}
	<div class="flex min-h-dvh items-center justify-center">
		<div class="text-center">
			{#if loadTimedOut}
				<p class="mb-2 text-lg text-gray-300">Game failed to load</p>
				<p class="mb-4 text-sm text-gray-500">This could be a connection issue.</p>
				<div class="flex justify-center gap-3">
					<button
						onclick={() => { loadTimedOut = false; ws.manualReconnect(); }}
						class="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent-light"
					>
						Retry
					</button>
					<a
						href="/"
						class="inline-block rounded-lg bg-surface-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-500"
					>
						Back to Lobby
					</a>
				</div>
			{:else}
				<div
					class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
				></div>
				<p class="text-gray-400">Loading game...</p>
			{/if}
		</div>
	</div>
{:else}
	<ConnectionBanner
		reconnecting={ws.reconnecting}
		retriesExhausted={ws.retriesExhausted}
		onReconnect={() => ws.manualReconnect()}
	/>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex h-dvh flex-col overflow-hidden" onkeydown={handleKeydown}>
		<!-- Top bar: phase timeline + controls -->
		<header class="flex items-center justify-between px-4 py-2">
			<PhaseBar currentPhase={game.gameState?.phaseType ?? null} isMyTurn={game.isMyTurn} />
			<div class="flex items-center gap-3">
				<div class="text-sm text-gray-400" data-testid="turn-indicator">
					{#if game.isMyTurn}
						<span class="font-semibold text-accent-light">Your turn</span>
					{:else}
						Waiting for <span class="font-semibold">{currentPlayerName}</span>
					{/if}
				</div>
				<!-- Audio toggle -->
				<button
					onclick={() => audio.toggle()}
					class="cursor-pointer rounded-lg bg-surface-700 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-surface-600 hover:text-gray-200"
					title={audio.enabled ? 'Mute sounds' : 'Unmute sounds'}
				>
					{audio.enabled ? '🔊' : '🔇'}
				</button>
				<!-- Connection status -->
				<span
					class="h-2 w-2 rounded-full"
					class:bg-green-500={ws.connected}
					class:bg-red-500={!ws.connected}
					role="status"
					aria-label={ws.connected ? 'Connected to server' : 'Disconnected from server'}
					title={ws.connected ? 'Connected to server' : 'Disconnected from server'}
				></span>
			</div>
		</header>

		<!-- Main content: sidebar + map + action panel -->
		<div class="flex flex-1 gap-4 overflow-hidden px-4 pb-4 pb-16 md:pb-4">
			<!-- Left sidebar (desktop only, mobile has bottom bar) -->
			{#if game.playersState && game.gameState}
				<StatusBar
					players={game.playersState.players}
					currentTurn={game.gameState.turn}
					myUserId={auth.user?.id ?? null}
					mission={game.missionState}
					connected={ws.connected}
					boardState={game.boardState}
					mapLayers={mapData.layers}
					continents={mapData.continents}
				/>
			{/if}

			<!-- Map -->
			<div class="relative flex-1 overflow-hidden rounded-2xl bg-surface-800">
				<GameMap
					viewBox={mapData.viewBox}
					continents={mapData.continents}
					layers={mapData.layers}
					regionMap={game.regionMap}
					{playerColors}
					{selectedRegionId}
					{validTargetIds}
					myUserId={auth.user?.id ?? null}
					onRegionClick={handleRegionClick}
				/>
			</div>

			<!-- Action panel (right side) -->
			{#if game.isMyTurn && game.gameState && ws.connected}
				<ActionPanel
					interaction={moveState.interaction}
					gameState={game.gameState}
					boardState={game.boardState}
					cardState={game.cardState}
					regionMap={game.regionMap}
					deployableTroops={game.deployableTroops}
					conquerState={game.conquerState}
					{moveState}
				/>
			{/if}
		</div>
	</div>

	<!-- Game over overlay -->
	{#if gameOver}
		<GameOverOverlay won={gameOver.won} playerName={gameOver.winnerName} stats={gameStats} />
	{/if}
{/if}
