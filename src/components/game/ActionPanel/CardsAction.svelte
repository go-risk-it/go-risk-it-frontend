<script lang="ts">
	/**
	 * Cards phase action panel for selecting and playing card combinations.
	 * Valid combinations are 3 cards of the same type or 1 of each type; Jolly cards
	 * are wild. Cards already assigned to a combination are excluded from the available
	 * pool. When a third card completes a valid set, it is auto-promoted to a combination.
	 * Multiple combinations can be queued and submitted in a single API call.
	 */
	import type { CardState, GameState, Card, Region } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { playCards, advance } from '$lib/api/moves';
	import { isCardSelectable, isValidCombination, getCombinationReward, getRegionBonuses } from '$lib/utils/cards';
	import { formatRegionName } from '$lib/utils/format';
	import { playCardPlay } from '$lib/audio/audio.svelte';
	import { useAction } from '$lib/state/use-action.svelte';

	interface Props {
		cardState: CardState;
		gameState: GameState;
		regionMap: Map<string, Region>;
		myUserId: string | null;
		interaction: {
			phase: 'cards';
			selectedCardIds: number[];
			combinations: { cardIDs: number[] }[];
		};
		moveState: ReturnType<typeof createMoveState>;
	}

	let { cardState, gameState, regionMap, myUserId, interaction, moveState }: Props = $props();

	// Card IDs already committed to a combination — excluded from the selection pool
	const existingCombinationCardIds = $derived(interaction.combinations.flatMap((c) => c.cardIDs));

	// Cards not yet assigned to any combination
	const availableCards = $derived(
		cardState.cards.filter((c) => !existingCombinationCardIds.includes(c.id))
	);

	// Set of region IDs owned by current player (for region bonus highlighting)
	const ownedRegionIds = $derived.by(() => {
		const owned = new Set<string>();
		if (!myUserId) return owned;
		for (const [, region] of regionMap) {
			if (region.ownerId === myUserId) owned.add(region.id);
		}
		return owned;
	});

	const action = useAction();

	// Auto-promote flash animation
	let flashCombo = $state<{ reward: number; timestamp: number } | null>(null);

	/**
	 * Toggles a card in/out of the current selection. When the selection reaches
	 * 3 cards, automatically validates the combination and promotes it if valid;
	 * otherwise keeps the selection for the player to adjust.
	 */
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
					// Show flash feedback
					const reward = getCombinationReward(selectedCards);
					if (reward) {
						flashCombo = { reward, timestamp: Date.now() };
						setTimeout(() => (flashCombo = null), 2000);
					}
					moveState.addCardCombination(selected);
					return;
				}
			}
			moveState.setSelectedCards(selected);
		}
	}

	/** Whether a card can be added to the current selection. */
	function canSelectCard(card: Card): boolean {
		if (interaction.selectedCardIds.includes(card.id)) return true;
		if (interaction.selectedCardIds.length >= 3) return false;
		return isCardSelectable(
			card,
			interaction.selectedCardIds,
			availableCards,
			existingCombinationCardIds
		);
	}

	/**
	 * Check if a card could complete a valid combo with the current selection.
	 * Used to show a "suggested" glow when 2 cards are selected.
	 */
	function isSuggestedCard(card: Card): boolean {
		if (interaction.selectedCardIds.length !== 2) return false;
		if (interaction.selectedCardIds.includes(card.id)) return false;
		const selectedCards = interaction.selectedCardIds.map(
			(id) => cardState.cards.find((c) => c.id === id)!
		);
		return isValidCombination([...selectedCards, card]);
	}

	/** Submits all queued combinations in one API call, then resets card selection state. */
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

	function cardTypeName(type: string): string {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}

	const CARD_TYPE_COLORS: Record<string, string> = {
		infantry: '#ef4444',
		cavalry: '#3b82f6',
		artillery: '#22c55e',
		jolly: '#eab308'
	};

	/** Resolve a combo's card objects from their IDs. */
	function resolveCards(cardIDs: number[]): Card[] {
		return cardIDs.map((id) => cardState.cards.find((c) => c.id === id)!).filter(Boolean);
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Cards</h3>

	<div class="rounded bg-surface-700/50 px-2.5 py-2 text-xs text-gray-400">
		<div class="mb-1 font-semibold text-gray-300">Valid combinations:</div>
		<div>3 of the same type, or 1 of each type</div>
		<div class="mt-1">Jolly &#9733; counts as any type</div>
	</div>

	<!-- Auto-promote flash feedback -->
	{#if flashCombo}
		<div class="combo-flash rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-center text-sm font-semibold text-accent-light">
			Valid combination! +{flashCombo.reward} troops
		</div>
	{/if}

	{#if cardState.cards.length === 0}
		<p class="text-sm text-gray-500">No cards in hand.</p>
	{:else}
		<div class="grid grid-cols-2 gap-2 min-[375px]:grid-cols-3">
			{#each availableCards as card (card.id)}
				{@const isSelected = interaction.selectedCardIds.includes(card.id)}
				{@const selectable = canSelectCard(card)}
				{@const suggested = isSuggestedCard(card)}
				{@const ownsRegion = card.region !== '' && ownedRegionIds.has(card.region)}
				<button
					onclick={() => toggleCard(card)}
					disabled={!selectable}
					data-testid="card-{card.id}"
					class="card-container flex cursor-pointer flex-col items-center rounded-lg border px-2 py-2 text-xs transition-all"
					class:card-selected={isSelected}
					class:card-suggested={suggested && !isSelected}
					class:border-accent={isSelected}
					class:bg-accent-selected={isSelected}
					class:border-gray-600={!isSelected && selectable && !suggested}
					class:border-amber-500={suggested && !isSelected}
					class:border-gray-700={!selectable}
					class:opacity-40={!selectable}
					style="border-top: 3px solid {CARD_TYPE_COLORS[card.type] ?? '#666'}"
				>
					<span class="text-lg">{cardTypeIcon(card.type)}</span>
					<span class="mt-0.5 font-medium capitalize">{card.type}</span>
					{#if card.region}
						<span
							class="mt-0.5 truncate text-center leading-tight"
							class:text-accent-light={ownsRegion}
							class:text-gray-500={!ownsRegion}
							style="font-size: 0.6rem; max-width: 100%"
							title={formatRegionName(card.region)}
						>
							{formatRegionName(card.region)}
						</span>
						{#if ownsRegion}
							<span class="mt-0.5 text-accent-light" style="font-size: 0.55rem">+2 bonus</span>
						{/if}
					{:else}
						<span class="mt-0.5 text-gray-600" style="font-size: 0.6rem">Wild</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if interaction.combinations.length > 0}
		<div class="space-y-2">
			<div class="text-xs font-semibold text-gray-400">Combinations to play:</div>
			{#each interaction.combinations as combo, i (i)}
				{@const cards = resolveCards(combo.cardIDs)}
				{@const reward = getCombinationReward(cards)}
				{@const bonuses = getRegionBonuses(cards, ownedRegionIds)}
				<div class="rounded-lg bg-surface-700 px-3 py-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-1.5 text-xs">
							{#each cards as c, j (c.id)}
								{#if j > 0}
									<span class="text-gray-600">+</span>
								{/if}
								<span title={cardTypeName(c.type)} style="color: {CARD_TYPE_COLORS[c.type] ?? '#ccc'}">
									{cardTypeIcon(c.type)}
								</span>
								<span class="text-gray-300">{cardTypeName(c.type)}</span>
							{/each}
						</div>
						<button
							onclick={() => moveState.removeCardCombination(i)}
							class="cursor-pointer text-red-400 hover:text-red-300">&times;</button
						>
					</div>
					<div class="mt-1 flex flex-wrap gap-2">
						{#if reward}
							<span class="rounded bg-accent/20 px-1.5 py-0.5 text-xs font-semibold text-accent-light">
								+{reward} troops
							</span>
						{/if}
						{#each bonuses as regionId (regionId)}
							<span class="rounded bg-green-900/30 px-1.5 py-0.5 text-xs text-green-400">
								+2 to {formatRegionName(regionId)}
							</span>
						{/each}
					</div>
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
	.card-selected {
		transform: scale(1.05);
	}
	.card-suggested {
		animation: suggest-pulse 1.5s ease-in-out infinite;
	}
	@keyframes suggest-pulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
		50% { box-shadow: 0 0 8px 2px rgba(245, 158, 11, 0.3); }
	}
	.combo-flash {
		animation: flash-in 0.3s ease-out;
	}
	@keyframes flash-in {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
