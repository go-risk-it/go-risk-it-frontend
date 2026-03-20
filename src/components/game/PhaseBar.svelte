<script lang="ts">
	import type { PhaseType } from '$lib/types/game';

	interface Props {
		currentPhase: PhaseType | null;
		isMyTurn: boolean;
	}

	let { currentPhase, isMyTurn }: Props = $props();

	const phases: { id: PhaseType; label: string }[] = [
		{ id: 'cards', label: 'Cards' },
		{ id: 'deploy', label: 'Deploy' },
		{ id: 'attack', label: 'Attack' },
		{ id: 'conquer', label: 'Conquer' },
		{ id: 'reinforce', label: 'Reinforce' }
	];
</script>

<div class="glass flex items-center gap-1 rounded-xl px-4 py-2">
	{#each phases as phase, i (phase.id)}
		{#if i > 0}
			<div class="mx-1 h-px w-4 bg-gray-600"></div>
		{/if}
		<div
			class="phase-node rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200"
			class:active={currentPhase === phase.id && isMyTurn}
			class:watching={currentPhase === phase.id && !isMyTurn}
			class:text-gray-500={currentPhase !== phase.id}
			class:scale-110={currentPhase === phase.id}
			data-testid="phase-{phase.id}"
		>
			{phase.label}
		</div>
	{/each}
</div>

<style>
	.phase-node.active {
		background-color: var(--color-accent);
		color: white;
		animation: phase-glow 2s ease-in-out infinite;
	}
	.phase-node.watching {
		color: var(--color-accent-light);
	}
	@keyframes phase-glow {
		0%,
		100% {
			box-shadow: 0 0 4px rgba(99, 102, 241, 0.4);
		}
		50% {
			box-shadow: 0 0 12px rgba(99, 102, 241, 0.7);
		}
	}
</style>
