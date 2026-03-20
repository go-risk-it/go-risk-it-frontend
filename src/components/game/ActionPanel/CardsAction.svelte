<script lang="ts">
	import type { CardState, GameState, Card } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { playCards, advance } from '$lib/api/moves';
	import { isCardSelectable, isValidCombination } from '$lib/utils/cards';
	import { playCardPlay } from '$lib/audio/audio.svelte';
	import { useAction } from '$lib/state/use-action.svelte';

	interface Props {
		cardState: CardState;
		gameState: GameState;
		interaction: {
			phase: 'cards';
			selectedCardIds: number[];
			combinations: { cardIDs: number[] }[];
		};
		moveState: ReturnType<typeof createMoveState>;
	}

	let { cardState, gameState, interaction, moveState }: Props = $props();

	const existingCombinationCardIds = $derived(interaction.combinations.flatMap((c) => c.cardIDs));

	const availableCards = $derived(
		cardState.cards.filter((c) => !existingCombinationCardIds.includes(c.id))
	);

	const action = useAction();

	function toggleCard(card: Card) {
		const selected = [...interaction.selectedCardIds];
		const idx = selected.indexOf(card.id);

		if (idx >= 0) {
			selected.splice(idx, 1);
			moveState.setSelectedCards(selected);
		} else if (selected.length < 3) {
			selected.push(card.id);
			// Check if we now have a valid combination
			if (selected.length === 3) {
				const selectedCards = selected.map((id) => cardState.cards.find((c) => c.id === id)!);
				if (isValidCombination(selectedCards)) {
					moveState.addCardCombination(selected);
					return;
				}
			}
			moveState.setSelectedCards(selected);
		}
	}

	function canSelectCard(card: Card): boolean {
		if (interaction.selectedCardIds.includes(card.id)) return true;
		if (interaction.selectedCardIds.length >= 3) return false;
		return isCardSelectable(card, interaction.selectedCardIds, availableCards, existingCombinationCardIds);
	}

	async function handlePlayCards() {
		if (interaction.combinations.length === 0) return;
		await action.run(async () => {
			await playCards(gameState.id, { combinations: interaction.combinations });
			playCardPlay();
			moveState.startPhase('cards');
		}, 'Play cards failed');
	}

	async function handleAdvance() {
		await action.run(async () => {
			await advance(gameState.id, { currentPhase: 'cards' });
		}, 'Advance failed');
	}

	function cardTypeIcon(type: string): string {
		switch (type) {
			case 'infantry':
				return '\u2694';
			case 'cavalry':
				return '\u265E';
			case 'artillery':
				return '\u2740';
			case 'jolly':
				return '\u2605';
			default:
				return '?';
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Cards</h3>

	<div class="rounded bg-surface-700/50 px-2.5 py-2 text-xs text-gray-400">
		<div class="mb-1 font-semibold text-gray-300">Valid combinations:</div>
		<div>3 of the same type, or 1 of each type</div>
		<div class="mt-1">Jolly &#9733; counts as any type</div>
	</div>

	{#if cardState.cards.length === 0}
		<p class="text-sm text-gray-500">No cards in hand.</p>
	{:else}
		<div class="grid grid-cols-2 gap-2 min-[375px]:grid-cols-3">
			{#each availableCards as card (card.id)}
				{@const isSelected = interaction.selectedCardIds.includes(card.id)}
				{@const selectable = canSelectCard(card)}
				<button
					onclick={() => toggleCard(card)}
					disabled={!selectable}
					data-testid="card-{card.id}"
					class="flex cursor-pointer flex-col items-center rounded-lg border px-2 py-2 text-xs transition-all"
					class:border-accent={isSelected}
					class:bg-accent-selected={isSelected}
					class:border-gray-600={!isSelected && selectable}
					class:border-gray-700={!selectable}
					class:opacity-40={!selectable}
				>
					<span class="text-lg">{cardTypeIcon(card.type)}</span>
					<span class="mt-1 capitalize">{card.type}</span>
				</button>
			{/each}
		</div>
	{/if}

	{#if interaction.combinations.length > 0}
		<div class="space-y-1">
			<div class="text-xs text-gray-400">Combinations to play:</div>
			{#each interaction.combinations as combo, i}
				<div class="flex items-center justify-between rounded bg-surface-700 px-2 py-1 text-xs">
					<span>Set {i + 1}: {combo.cardIDs.join(', ')}</span>
					<button
						onclick={() => moveState.removeCardCombination(i)}
						class="cursor-pointer text-red-400 hover:text-red-300">&times;</button
					>
				</div>
			{/each}
		</div>

		{#if action.error}
			<div class="text-xs text-red-400">{action.error}</div>
		{/if}

		<button
			onclick={handlePlayCards}
			disabled={action.submitting}
			data-testid="play-cards-btn"
			class="w-full cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
		>
			{action.submitting ? 'Playing...' : 'Play Cards'}
		</button>
	{/if}

	<button
		onclick={handleAdvance}
		data-testid="skip-cards-btn"
		class="w-full cursor-pointer rounded-lg bg-surface-600 py-2 text-sm transition-colors hover:bg-surface-500"
	>
		Skip to Deploy
	</button>
</div>

<style>
	.bg-accent-selected {
		background-color: color-mix(in srgb, var(--color-accent) 20%, transparent);
	}
</style>
