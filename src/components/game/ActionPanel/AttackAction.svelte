<script lang="ts">
	/**
	 * Attack phase action panel with instant click-to-attack and optional blitz mode.
	 * Step 1: select source, Step 2: click enemy to attack (or Shift+click for slider).
	 * Blitz mode repeats attacks until one side is depleted, handling conquests mid-blitz.
	 */
	import type { Region, GameState, ConquerPhaseState } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { attack, advance, conquer as conquerApi } from '$lib/api/moves';
	import { playAttack } from '$lib/audio/audio.svelte';
	import { useAction } from '$lib/state/use-action.svelte';
	import { formatRegionName } from '$lib/utils/format';
	import TroopSlider from '../../ui/TroopSlider.svelte';
	import StepProgress from '../../ui/StepProgress.svelte';

	interface Props {
		regionMap: Map<string, Region>;
		gameState: GameState;
		interaction: {
			phase: 'attack';
			sourceRegionId: string | null;
			targetRegionId: string | null;
			attackingTroops: number;
		};
		moveState: ReturnType<typeof createMoveState>;
		conquerState: ConquerPhaseState | null;
		onNextBoardState: () => Promise<void>;
	}

	let { regionMap, gameState, interaction, moveState, conquerState, onNextBoardState }: Props =
		$props();

	const action = useAction();

	const sourceRegion = $derived(
		interaction.sourceRegionId ? regionMap.get(interaction.sourceRegionId) : null
	);
	const targetRegion = $derived(
		interaction.targetRegionId ? regionMap.get(interaction.targetRegionId) : null
	);
	const maxAttackingTroops = $derived(Math.min((sourceRegion?.troops ?? 1) - 1, 3));

	// Step progression: 1 = pick source, 2 = pick target, 3 = confirm attack (Shift+click)
	const currentStep = $derived.by(() => {
		if (!interaction.sourceRegionId) return 1;
		if (!interaction.targetRegionId) return 2;
		return 3;
	});

	// Blitz state
	let blitzActive = $state(false);
	let blitzCasualties = $state({ attacker: 0, defender: 0 });

	/**
	 * Submits the attack move. Keeps source selected for chaining.
	 */
	async function handleAttack() {
		if (
			!interaction.sourceRegionId ||
			!interaction.targetRegionId ||
			!sourceRegion ||
			!targetRegion
		)
			return;
		const sourceId = interaction.sourceRegionId;
		await action.run(async () => {
			await attack(gameState.id, {
				sourceRegionId: interaction.sourceRegionId!,
				targetRegionId: interaction.targetRegionId!,
				troopsInSource: sourceRegion!.troops,
				troopsInTarget: targetRegion!.troops,
				attackingTroops: interaction.attackingTroops
			});
			playAttack();
			moveState.setAttackSource(sourceId);
		}, 'Attack failed');
	}

	/**
	 * Blitz: repeatedly attack with max troops until one side is depleted.
	 * Handles mid-blitz conquests by auto-conquering with minimum troops.
	 */
	async function handleBlitz() {
		if (!interaction.sourceRegionId || !interaction.targetRegionId) return;
		const srcId = interaction.sourceRegionId;
		const tgtId = interaction.targetRegionId;

		blitzActive = true;
		blitzCasualties = { attacker: 0, defender: 0 };

		try {
			while (blitzActive) {
				// Read fresh state
				const src = regionMap.get(srcId);
				const tgt = regionMap.get(tgtId);
				if (!src || !tgt) break;
				if (src.troops <= 1) break;
				if (tgt.troops <= 0) break;

				// Check if target is already ours (conquered)
				if (src.ownerId === tgt.ownerId) break;

				const troops = Math.min(src.troops - 1, 3);
				const prevSrcTroops = src.troops;
				const prevTgtTroops = tgt.troops;

				try {
					await attack(gameState.id, {
						sourceRegionId: srcId,
						targetRegionId: tgtId,
						troopsInSource: src.troops,
						troopsInTarget: tgt.troops,
						attackingTroops: troops
					});
					playAttack();
				} catch {
					break; // Attack failed, stop blitz
				}

				// Wait for board state update from WebSocket
				await onNextBoardState();

				// Read updated state and compute casualties
				const newSrc = regionMap.get(srcId);
				const newTgt = regionMap.get(tgtId);
				if (newSrc) {
					const srcLoss = prevSrcTroops - newSrc.troops;
					if (srcLoss > 0) blitzCasualties.attacker += srcLoss;
				}
				if (newTgt) {
					const tgtLoss = prevTgtTroops - newTgt.troops;
					if (tgtLoss > 0) blitzCasualties.defender += tgtLoss;
				}

				// Check if we entered conquer phase (territory was captured)
				if (gameState.phaseType === 'conquer') {
					// Auto-conquer with minimum troops
					if (conquerState) {
						try {
							await conquerApi(gameState.id, { troops: conquerState.minTroopsToMove });
						} catch {
							break;
						}
						// Wait for board state to reflect the conquer
						await onNextBoardState();

						// After conquer, we may return to attack phase.
						// Wait for the game state to settle — another board state update may come
						// The conquered territory is now ours; check if we should continue
						await onNextBoardState();
					}
					break; // Stop blitz after conquest — territory is taken
				}
			}
		} finally {
			blitzActive = false;
			// Re-select source for chaining
			if (regionMap.get(srcId)?.troops ?? 0 > 1) {
				moveState.setAttackSource(srcId);
			}
		}
	}

	function cancelBlitz() {
		blitzActive = false;
	}

	/** Advances past the attack phase without attacking (skip to reinforce). */
	async function handleAdvance() {
		await action.run(async () => {
			await advance(gameState.id, { currentPhase: 'attack' });
		}, 'Advance failed');
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Attack</h3>
		<StepProgress current={currentStep} total={3} />
	</div>

	{#if blitzActive}
		<!-- Blitz in progress -->
		<div class="space-y-3">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
				<span class="text-sm font-semibold text-red-400">Blitz in progress...</span>
			</div>
			<div class="flex gap-4 text-xs">
				<span class="text-red-300">Your losses: {blitzCasualties.attacker}</span>
				<span class="text-blue-300">Enemy losses: {blitzCasualties.defender}</span>
			</div>
			<button
				onclick={cancelBlitz}
				class="w-full cursor-pointer rounded-lg bg-yellow-600 py-2 text-sm font-semibold transition-colors hover:bg-yellow-500"
			>
				Cancel Blitz
			</button>
		</div>
	{:else if !interaction.sourceRegionId}
		<p class="text-sm text-gray-500">
			<span class="text-xs text-gray-400">Step 1:</span> Select your region (2+ troops)
		</p>
	{:else if !interaction.targetRegionId}
		<div class="space-y-2">
			<div class="text-sm">
				<span class="text-gray-400">From:</span>
				<span class="font-semibold"
					>{formatRegionName(interaction.sourceRegionId)} ({sourceRegion?.troops})</span
				>
			</div>
			<p class="text-sm text-gray-500">
				<span class="text-xs text-gray-400">Step 2:</span> Click enemy to attack
			</p>
			<p class="text-xs text-gray-600">
				Hold Shift for custom troop count
			</p>
			<button
				onclick={() => moveState.setAttackSource('')}
				class="cursor-pointer text-xs text-gray-500 underline hover:text-gray-300"
			>
				Cancel selection
			</button>
		</div>
	{:else}
		<div class="space-y-3">
			<div class="text-sm">
				<span class="text-gray-400">From:</span>
				<span class="font-semibold"
					>{formatRegionName(interaction.sourceRegionId)} ({sourceRegion?.troops})</span
				>
			</div>
			<div class="text-sm">
				<span class="text-gray-400">Target:</span>
				<span class="font-semibold"
					>{formatRegionName(interaction.targetRegionId)} ({targetRegion?.troops})</span
				>
			</div>

			<div>
				<TroopSlider
					id="attack-slider"
					label="Attacking troops"
					min={1}
					max={maxAttackingTroops}
					value={interaction.attackingTroops}
					onchange={(v) => moveState.setAttackingTroops(v)}
					onmax={() => moveState.setAttackingTroops(maxAttackingTroops)}
				/>
			</div>

			{#if action.error}
				<div class="text-xs text-red-400">{action.error}</div>
			{/if}

			<div class="flex gap-2">
				<button
					onclick={handleAttack}
					disabled={action.submitting}
					data-testid="attack-btn"
					class="flex-1 cursor-pointer rounded-lg bg-red-600 py-2 text-sm font-semibold transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{action.submitting ? 'Attacking...' : `Attack with ${interaction.attackingTroops}`}
				</button>
				<button
					onclick={handleBlitz}
					disabled={action.submitting}
					data-testid="blitz-btn"
					class="cursor-pointer rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
					title="Repeat attacks until one side is depleted"
				>
					Blitz
				</button>
			</div>
		</div>
	{/if}

	{#if !blitzActive}
		<button
			onclick={handleAdvance}
			data-testid="skip-attack-btn"
			class="w-full cursor-pointer rounded-lg bg-surface-600 py-2 text-sm transition-colors hover:bg-surface-500"
		>
			Skip to Reinforce
		</button>
	{/if}
</div>
