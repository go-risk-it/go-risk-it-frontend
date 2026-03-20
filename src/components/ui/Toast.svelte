<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getToasts } from '$lib/state/toast.svelte';

	const toasts = getToasts();
</script>

<div class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
	{#each toasts.items as toast (toast.id)}
		<div
			transition:fly={{ x: 100, duration: 200 }}
			class="pointer-events-auto max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg
				{toast.type === 'error' ? 'toast-error' : toast.type === 'success' ? 'toast-success' : 'toast-info'}"
			role="alert"
		>
			<div class="flex items-center justify-between gap-3">
				<span>{toast.message}</span>
				<button
					onclick={() => toasts.dismiss(toast.id)}
					class="cursor-pointer text-white/60 hover:text-white"
				>
					&times;
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.toast-error {
		background-color: color-mix(in srgb, #ef4444 90%, transparent);
	}
	.toast-success {
		background-color: color-mix(in srgb, #22c55e 90%, transparent);
	}
	.toast-info {
		background-color: var(--color-surface-600);
	}
</style>
