/**
 * Generic async action wrapper that manages loading/error state and
 * automatically displays errors as toast notifications. Used by form
 * submissions and API calls throughout the UI to avoid boilerplate
 * try/catch/loading patterns.
 */

import { getToasts } from '$lib/state/toast.svelte';

/**
 * Create a reusable async action runner with reactive loading and error state.
 * @returns Reactive `submitting` and `error` getters, plus a `run` method.
 */
export function useAction() {
	let error = $state('');
	let submitting = $state(false);
	const toasts = getToasts();

	/**
	 * Execute an async function with automatic loading/error handling.
	 * On failure, the error message is stored in `error` and shown as a toast.
	 * @param fn - The async operation to execute.
	 * @param fallbackMsg - Message to use if the caught error is not an Error instance.
	 */
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
