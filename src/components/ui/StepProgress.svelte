<script lang="ts">
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
