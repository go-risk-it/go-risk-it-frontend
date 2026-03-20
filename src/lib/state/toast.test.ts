import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getToasts } from './toast.svelte';

describe('getToasts', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('starts with empty items', () => {
		const toasts = getToasts();
		expect(toasts.items).toEqual([]);
	});

	it('add appends a toast', () => {
		const toasts = getToasts();
		toasts.add('hello', 'info');
		expect(toasts.items.length).toBeGreaterThanOrEqual(1);
		const last = toasts.items[toasts.items.length - 1];
		expect(last.message).toBe('hello');
		expect(last.type).toBe('info');
	});

	it('defaults type to info', () => {
		const toasts = getToasts();
		toasts.add('test');
		const last = toasts.items[toasts.items.length - 1];
		expect(last.type).toBe('info');
	});

	it('auto-removes after duration', () => {
		const toasts = getToasts();
		const initialLength = toasts.items.length;
		toasts.add('temp', 'error', 2000);
		expect(toasts.items.length).toBe(initialLength + 1);
		vi.advanceTimersByTime(2000);
		expect(toasts.items.length).toBe(initialLength);
	});

	it('dismiss removes by id immediately', () => {
		const toasts = getToasts();
		toasts.add('first', 'success');
		toasts.add('second', 'error');
		const secondId = toasts.items[toasts.items.length - 1].id;
		toasts.dismiss(secondId);
		expect(toasts.items.find((t) => t.id === secondId)).toBeUndefined();
	});

	it('multiple toasts maintain order', () => {
		const toasts = getToasts();
		const baseLen = toasts.items.length;
		toasts.add('a', 'info');
		toasts.add('b', 'error');
		toasts.add('c', 'success');
		const recent = toasts.items.slice(baseLen);
		expect(recent.map((t) => t.message)).toEqual(['a', 'b', 'c']);
	});
});
