<script lang="ts">
	/**
	 * Minimal step progress indicator rendered as a row of small dots. Dots up to the
	 * current step are highlighted with the accent color; remaining dots are dimmed.
	 * Used to show phase progression within a game turn.
	 */
	interface Props {
		current: number;
		total: number;
	}

	let { current, total }: Props = $props();
</script>

<div class="flex gap-1">
	{#each Array.from({ length: total }, (_, i) => i + 1) as step}
		<div
			class="h-1.5 w-4 rounded-full transition-colors"
			class:bg-accent={step <= current}
			class:bg-surface-600={step > current}
		></div>
	{/each}
</div>
