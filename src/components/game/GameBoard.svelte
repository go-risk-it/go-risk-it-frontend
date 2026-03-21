<script lang="ts">
	/**
	 * Top-level game board that orchestrates the entire in-game experience. Initializes
	 * WebSocket connectivity, game state, and move state; wires up effects for turn
	 * notifications, sound, phase transitions, and game-over detection. Delegates rendering
	 * to GameMap, StatusBar, ActionPanel, and overlay components.
	 */
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
	import { attack as attackApi } from '$lib/api/moves';
	import {
		playTurnStart,
		playConquer,
		playAttack,
		playVictory,
		playDefeat,
		audio
	} from '$lib/audio/audio.svelte';

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

	// Reconnect WebSocket when auth token refreshes (covers both connected and retry-backoff states)
	let prevToken = $state(auth.accessToken);
	$effect(() => {
		const token = auth.accessToken;
		if (prevToken && token && token !== prevToken && (ws.connected || ws.reconnecting)) {
			ws.reconnectWithNewToken();
		}
		prevToken = token;
	});

	// Sync move state with game phase changes
	$effect(() => {
		if (game.isMyTurn && game.phase) {
			const phaseType = game.phase.type;
			moveState.startPhase(phaseType);

			// Track conquered territory for attack chaining
			if (phaseType === 'conquer' && game.conquerState) {
				moveState.setLastConqueredRegionId(game.conquerState.defendingRegionId);
			}

			// Auto-select conquered territory when returning to attack phase
			if (phaseType === 'attack' && moveState.lastConqueredRegionId) {
				const conqueredRegion = game.regionMap.get(moveState.lastConqueredRegionId);
				if (
					conqueredRegion &&
					conqueredRegion.ownerId === auth.user?.id &&
					conqueredRegion.troops > 1
				) {
					moveState.setAttackSource(moveState.lastConqueredRegionId);
				}
				moveState.clearLastConqueredRegionId();
			}
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
		if (game.phase?.type === 'conquer' && game.isMyTurn) {
			playConquer();
		}
	});

	// Game over when exactly one player remains alive
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
		const turnsPlayed = Math.ceil(
			(game.gameState.turn + 1) / (game.playersState?.players.length ?? 1)
		);
		return {
			territories: myRegions.length,
			totalTroops,
			cardsHeld: game.cardState.cards.length,
			turnsPlayed
		};
	});

	// Adjacency graph for computing valid attack/reinforce targets; rebuilt when board changes
	const graph = $derived.by(() => {
		if (!game.boardState || !mapData.loaded) return null;
		return new Graph(mapData.links, game.boardState);
	});

	// Player colors
	const playerColors = $derived.by(() => {
		if (!game.playersState) return new Map<string, string>();
		return buildPlayerColorMap(game.playersState.players);
	});

	// Regions that border a different continent (for thicker stroke emphasis)
	const continentBorderRegions = $derived.by(() => {
		const borders = new Set<string>();
		if (!graph || !mapData.loaded) return borders;
		for (const layer of mapData.layers) {
			const regionContinent = mapData.getContinentForRegion(layer.id);
			if (!regionContinent) continue;
			const neighbors = graph.getNeighbors(layer.id);
			for (const nId of neighbors) {
				const neighborContinent = mapData.getContinentForRegion(nId);
				if (neighborContinent && neighborContinent !== regionContinent) {
					borders.add(layer.id);
					break;
				}
			}
		}
		return borders;
	});

	// Continent control: detect when one player owns all regions in a continent
	const controlledContinents = $derived.by(() => {
		const result = new Map<
			string,
			{ ownerId: string; bonusTroops: number; continentName: string }
		>();
		if (!game.boardState || !mapData.loaded) return result;
		for (const continent of mapData.continents) {
			const regionIds = mapData.getRegionsInContinent(continent.id);
			if (regionIds.length === 0) continue;
			const firstRegion = game.regionMap.get(regionIds[0]);
			if (!firstRegion) continue;
			const ownerId = firstRegion.ownerId;
			const allOwned = regionIds.every((rId) => {
				const r = game.regionMap.get(rId);
				return r && r.ownerId === ownerId;
			});
			if (allOwned) {
				result.set(continent.id, {
					ownerId,
					bonusTroops: continent.bonus_troops,
					continentName: continent.name
				});
			}
		}
		return result;
	});

	/**
	 * Computes the set of region IDs that are valid click targets for the current
	 * move interaction. For attack: adjacent enemy regions. For reinforce: any
	 * friendly region reachable through a connected chain of owned territories.
	 */
	const validTargetIds = $derived.by(() => {
		const targets = new Set<string>();
		if (!graph || !game.boardState) return targets;
		const interaction = moveState.interaction;

		if (interaction.phase === 'attack' && interaction.sourceRegionId) {
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

	/**
	 * Executes an instant attack with max troops (min(sourceTroops - 1, 3)).
	 * Used by click-click-go when no Shift is held.
	 */
	async function executeInstantAttack(sourceRegionId: string, targetRegionId: string) {
		const source = game.regionMap.get(sourceRegionId);
		const target = game.regionMap.get(targetRegionId);
		if (!source || !target || !game.gameState) return;

		const attackingTroops = Math.min(source.troops - 1, 3);
		try {
			await attackApi(game.gameState.id, {
				sourceRegionId,
				targetRegionId,
				troopsInSource: source.troops,
				troopsInTarget: target.troops,
				attackingTroops
			});
			playAttack();
			// Keep source selected for chaining
			moveState.setAttackSource(sourceRegionId);
		} catch {
			// Errors are handled by the action panel if user retries manually
		}
	}

	/**
	 * Handles map region clicks by dispatching to the appropriate move-state
	 * action based on the current phase. In attack/reinforce, implements a
	 * two-step source-then-target selection with re-selection support.
	 * In attack phase, clicking a valid target instantly attacks with max troops
	 * unless Shift is held (which shows the troop slider).
	 */
	function handleRegionClick(regionId: string, event: MouseEvent | KeyboardEvent) {
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
					// Valid target clicked
					if (event.shiftKey) {
						// Shift+click: show slider for custom troop count
						moveState.setAttackTarget(regionId);
					} else {
						// Instant attack with max troops
						executeInstantAttack(interaction.sourceRegionId, regionId);
					}
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
						onclick={() => {
							loadTimedOut = false;
							ws.manualReconnect();
						}}
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
		parseError={ws.parseError}
		onReconnect={() => ws.manualReconnect()}
	/>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex h-dvh flex-col overflow-hidden" onkeydown={handleKeydown}>
		<!-- Top bar: phase timeline + controls -->
		<header class="flex items-center justify-between px-4 py-2">
			<PhaseBar currentPhase={game.phase?.type ?? null} isMyTurn={game.isMyTurn} />
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
					links={mapData.links}
					regionMap={game.regionMap}
					{playerColors}
					{selectedRegionId}
					{validTargetIds}
					{continentBorderRegions}
					{controlledContinents}
					currentPhase={game.phase?.type ?? null}
					sourceRegionId={moveState.interaction.phase === 'attack'
						? moveState.interaction.sourceRegionId
						: moveState.interaction.phase === 'reinforce'
							? moveState.interaction.sourceRegionId
							: null}
					targetRegionId={moveState.interaction.phase === 'reinforce' &&
					'targetRegionId' in moveState.interaction
						? moveState.interaction.targetRegionId
						: null}
					myUserId={auth.user?.id ?? null}
					onRegionClick={handleRegionClick}
				/>
			</div>

			<!-- Action panel (right side) -->
			{#if game.isMyTurn && game.gameState && ws.connected}
				<ActionPanel
					interaction={moveState.interaction}
					gameState={game.gameState}
					cardState={game.cardState}
					regionMap={game.regionMap}
					deployableTroops={game.deployableTroops}
					conquerState={game.conquerState}
					{moveState}
					onNextBoardState={game.onNextBoardState}
				/>
			{/if}
		</div>
	</div>

	<!-- Game over overlay -->
	{#if gameOver}
		<GameOverOverlay won={gameOver.won} playerName={gameOver.winnerName} stats={gameStats} />
	{/if}
{/if}
