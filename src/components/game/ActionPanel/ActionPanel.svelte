<script lang="ts">
	import { fly } from 'svelte/transition';
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
	}

	let {
		interaction,
		gameState,
		boardState,
		cardState,
		regionMap,
		deployableTroops,
		conquerState,
		moveState
	}: Props = $props();
</script>

<!-- Desktop: right panel -->
<aside
	class="glass hidden w-72 flex-col rounded-2xl p-4 md:flex"
	transition:fly={{ x: 50, duration: 200 }}
>
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
</aside>

<!-- Mobile: bottom sheet -->
<div
	class="glass fixed right-0 bottom-0 left-0 z-40 max-h-[50dvh] overflow-y-auto rounded-t-2xl p-4 md:hidden"
	transition:fly={{ y: 100, duration: 200 }}
>
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
</div>
