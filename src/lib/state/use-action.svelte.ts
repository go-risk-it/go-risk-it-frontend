import { getToasts } from '$lib/state/toast.svelte';

export function useAction() {
	let error = $state('');
	let submitting = $state(false);
	const toasts = getToasts();

	async function run(fn: () => Promise<void>, fallbackMsg: string) {
		error = '';
		submitting = true;
		try {
			await fn();
		} catch (err) {
			const msg = err instanceof Error ? err.message : fallbackMsg;
			error = msg;
			toasts.add(msg, 'error');
		} finally {
			submitting = false;
		}
	}

	return {
		get error() {
			return error;
		},
		get submitting() {
			return submitting;
		},
		run
	};
}
