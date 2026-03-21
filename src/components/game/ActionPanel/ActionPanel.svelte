<script lang="ts">
	/**
	 * Responsive action panel that routes to the correct phase-specific action component
	 * (Cards, Deploy, Attack, Conquer, Reinforce) based on the current move interaction.
	 * Renders as a right-side panel on desktop (md+) and a collapsible bottom sheet on mobile.
	 */
	import { fly, slide } from 'svelte/transition';
	import type {
		BoardState,
		CardState,
		ConquerPhaseState,
		GameState,
		Region
	} from '$lib/types/game';
	import type { MoveInteraction, createMoveState } from '$lib/state/move-state.svelte';
	import DeployAction from './DeployAction.svelte';
	import AttackAction from './AttackAction.svelte';
	import ConquerAction from './ConquerAction.svelte';
	import ReinforceAction from './ReinforceAction.svelte';
	import CardsAction from './CardsAction.svelte';

	interface Props {
		interaction: MoveInteraction;
		gameState: GameState;
		boardState: BoardState;
		cardState: CardState;
		regionMap: Map<string, Region>;
		deployableTroops: number;
		conquerState: ConquerPhaseState | null;
		moveState: ReturnType<typeof createMoveState>;
		onNextBoardState: () => Promise<void>;
	}

	let {
		interaction,
		gameState,
		boardState,
		cardState,
		regionMap,
		deployableTroops,
		conquerState,
		moveState,
		onNextBoardState
	}: Props = $props();

	let mobileCollapsed = $state(false);
</script>

{#snippet actionContent()}
	{#if interaction.phase === 'deploy'}
		<DeployAction
			{regionMap}
			{deployableTroops}
			gameId={gameState.id}
			interaction={interaction as { phase: 'deploy'; regionId: string | null; troops: number }}
			{moveState}
		/>
	{:else if interaction.phase === 'attack'}
		<AttackAction
			{regionMap}
			{gameState}
			interaction={interaction as {
				phase: 'attack';
				sourceRegionId: string | null;
				targetRegionId: string | null;
				attackingTroops: number;
			}}
			{moveState}
			{conquerState}
			{onNextBoardState}
		/>
	{:else if interaction.phase === 'conquer' && conquerState}
		<ConquerAction
			{regionMap}
			{conquerState}
			gameId={gameState.id}
			interaction={interaction as { phase: 'conquer'; troops: number }}
			{moveState}
		/>
	{:else if interaction.phase === 'reinforce'}
		<ReinforceAction
			{regionMap}
			{gameState}
			interaction={interaction as {
				phase: 'reinforce';
				sourceRegionId: string | null;
				targetRegionId: string | null;
				movingTroops: number;
			}}
			{moveState}
		/>
	{:else if interaction.phase === 'cards'}
		<CardsAction
			{cardState}
			{gameState}
			interaction={interaction as {
				phase: 'cards';
				selectedCardIds: number[];
				combinations: { cardIDs: number[] }[];
			}}
			{moveState}
		/>
	{:else}
		<p class="text-sm text-gray-500">Waiting...</p>
	{/if}
{/snippet}

<!-- Desktop: right panel -->
<aside
	class="glass hidden w-72 flex-col rounded-2xl p-4 md:flex"
	transition:fly={{ x: 50, duration: 200 }}
>
	{@render actionContent()}
</aside>

<!-- Mobile: bottom sheet (collapsible) -->
<div
	class="glass fixed right-0 bottom-0 left-0 z-40 rounded-t-2xl md:hidden"
	transition:fly={{ y: 100, duration: 200 }}
>
	<button
		onclick={() => (mobileCollapsed = !mobileCollapsed)}
		class="flex w-full cursor-pointer items-center justify-center gap-1 py-2"
		aria-label={mobileCollapsed ? 'Expand action panel' : 'Collapse action panel'}
	>
		<div class="h-1 w-8 rounded-full bg-gray-500"></div>
		<span class="text-xs text-gray-500">{mobileCollapsed ? '▲' : '▼'}</span>
	</button>
	{#if !mobileCollapsed}
		<div class="max-h-[35dvh] overflow-y-auto px-4 pb-4" transition:slide={{ duration: 200 }}>
			{@render actionContent()}
		</div>
	{/if}
</div>
