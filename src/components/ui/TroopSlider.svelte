<script lang="ts">
	/**
	 * Range slider for selecting troop counts during deploy, attack, and reinforce phases.
	 * Displays a label, the current value, and a "Max" shortcut button. The parent controls
	 * the value via onchange/onmax callbacks (uncontrolled slider pattern).
	 */
	interface Props {
		/** HTML id for the input element and its label association. */
		id: string;
		/** Descriptive label shown above the slider. */
		label: string;
		/** Minimum selectable troop count. */
		min: number;
		/** Maximum selectable troop count. */
		max: number;
		/** Current slider value (controlled by parent). */
		value: number;
		/** Called with the new value when the slider is dragged. */
		onchange: (value: number) => void;
		/** Called when the "Max" button is clicked. */
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
