interface ToastItem {
	id: number;
	message: string;
	type: 'error' | 'success' | 'info';
}

let toasts = $state<ToastItem[]>([]);
let nextId = 0;

export function getToasts() {
	return {
		get items() {
			return toasts;
		},
		add(message: string, type: ToastItem['type'] = 'info', duration = 4000) {
			const id = nextId++;
			toasts = [...toasts, { id, message, type }];
			setTimeout(() => {
				toasts = toasts.filter((t) => t.id !== id);
			}, duration);
		},
		dismiss(id: number) {
			toasts = toasts.filter((t) => t.id !== id);
		}
	};
}
