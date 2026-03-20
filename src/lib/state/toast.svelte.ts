/**
 * Global toast notification system. Manages a queue of toast messages with
 * auto-dismiss timers (4s for info/success, 8s for errors). Only the most
 * recent {@link MAX_VISIBLE} toasts are shown at a time; the internal array
 * is capped at 20 entries to bound memory.
 */

/** Maximum number of toasts visible simultaneously in the UI. */
const MAX_VISIBLE = 3;

/** A single toast notification entry. */
interface ToastItem {
	/** Auto-incrementing unique identifier. */
	id: number;
	/** Display text shown to the user. */
	message: string;
	/** Visual severity determining color and default auto-dismiss duration. */
	type: 'error' | 'success' | 'info';
	/** Timestamp (ms) when the toast was created. */
	createdAt: number;
}

let toasts = $state<ToastItem[]>([]);
let nextId = 0;

/**
 * Returns a reactive toast manager. Module-scoped state ensures a single
 * shared toast queue across all consumers.
 * @returns Methods to add, dismiss, and read visible toasts.
 */
export function getToasts() {
	return {
		/** The most recent MAX_VISIBLE toasts for rendering. */
		get items() {
			return toasts.slice(-MAX_VISIBLE);
		},
		/**
		 * Show a new toast notification.
		 * @param message - Text to display.
		 * @param type - Severity level (defaults to 'info').
		 * @param duration - Auto-dismiss delay in ms. Defaults to 8000 for errors, 4000 otherwise.
		 */
		add(message: string, type: ToastItem['type'] = 'info', duration?: number) {
			const effectiveDuration = duration ?? (type === 'error' ? 8000 : 4000);
			const id = nextId++;
			toasts = [...toasts, { id, message, type, createdAt: Date.now() }];
			// Cap the internal array to prevent unbounded growth
			if (toasts.length > 20) toasts = toasts.slice(-20);
			setTimeout(() => {
				toasts = toasts.filter((t) => t.id !== id);
			}, effectiveDuration);
		},
		/**
		 * Immediately remove a toast by ID (user-initiated dismiss).
		 * @param id - The toast's unique identifier.
		 */
		dismiss(id: number) {
			toasts = toasts.filter((t) => t.id !== id);
		}
	};
}
