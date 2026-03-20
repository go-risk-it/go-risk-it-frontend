const MAX_VISIBLE = 3;

interface ToastItem {
	id: number;
	message: string;
	type: 'error' | 'success' | 'info';
	createdAt: number;
}

let toasts = $state<ToastItem[]>([]);
let nextId = 0;

export function getToasts() {
	return {
		get items() {
			return toasts.slice(-MAX_VISIBLE);
		},
		add(message: string, type: ToastItem['type'] = 'info', duration?: number) {
			const effectiveDuration = duration ?? (type === 'error' ? 8000 : 4000);
			const id = nextId++;
			toasts = [...toasts, { id, message, type, createdAt: Date.now() }];
			if (toasts.length > 20) toasts = toasts.slice(-20);
			setTimeout(() => {
				toasts = toasts.filter((t) => t.id !== id);
			}, effectiveDuration);
		},
		dismiss(id: number) {
			toasts = toasts.filter((t) => t.id !== id);
		}
	};
}
