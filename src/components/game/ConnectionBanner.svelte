<script lang="ts">
	/**
	 * Fixed top banner showing WebSocket connection status. Displays a spinner
	 * during automatic reconnection attempts, and a manual "Reconnect" button
	 * once all automatic retries are exhausted.
	 */
	interface Props {
		reconnecting: boolean;
		retriesExhausted: boolean;
		onReconnect: () => void;
	}

	let { reconnecting, retriesExhausted, onReconnect }: Props = $props();
</script>

{#if reconnecting}
	<div
		class="fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-3 bg-yellow-600/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
		role="status"
	>
		<div
			class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
		></div>
		<span>Connection lost. Reconnecting...</span>
	</div>
{:else if retriesExhausted}
	<div
		class="fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-3 bg-red-600/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
		role="alert"
	>
		<span>Connection lost.</span>
		<button
			onclick={onReconnect}
			class="cursor-pointer rounded bg-white/20 px-3 py-1 text-sm font-semibold transition-colors hover:bg-white/30"
		>
			Reconnect
		</button>
	</div>
{/if}
