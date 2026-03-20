<script lang="ts">
	interface Props {
		id: string;
		label: string;
		min: number;
		max: number;
		value: number;
		onchange: (value: number) => void;
		onmax: () => void;
	}

	let { id, label, min, max, value, onchange, onmax }: Props = $props();
</script>

<div>
	<div class="mb-1 flex items-center justify-between">
		<label for={id} class="text-xs text-gray-400">{label}</label>
		<button
			onclick={onmax}
			class="cursor-pointer rounded bg-surface-600 px-2 py-0.5 text-xs text-gray-300 transition-colors hover:bg-surface-500"
		>
			Max
		</button>
	</div>
	<input
		{id}
		data-testid={id}
		type="range"
		{min}
		{max}
		{value}
		oninput={(e) => onchange(parseInt((e.target as HTMLInputElement).value))}
		class="w-full accent-accent"
	/>
	<div class="text-center text-sm font-semibold">{value} troops</div>
</div>
