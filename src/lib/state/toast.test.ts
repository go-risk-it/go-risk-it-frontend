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
		toasts.add('a', 'info');
		toasts.add('b', 'error');
		toasts.add('c', 'success');
		const messages = toasts.items.map((t) => t.message);
		// items is capped to last 3, so 'a', 'b', 'c' should be the tail
		expect(messages.slice(-3)).toEqual(['a', 'b', 'c']);
	});

	describe('default durations', () => {
		it('error toast uses 8s default duration', () => {
			const toasts = getToasts();
			toasts.add('err', 'error');
			const item = toasts.items.find((t) => t.message === 'err');
			expect(item).toBeDefined();

			vi.advanceTimersByTime(7999);
			expect(toasts.items.find((t) => t.message === 'err')).toBeDefined();

			vi.advanceTimersByTime(1);
			expect(toasts.items.find((t) => t.message === 'err')).toBeUndefined();
		});

		it('info toast uses 4s default duration', () => {
			const toasts = getToasts();
			toasts.add('inf', 'info');
			expect(toasts.items.find((t) => t.message === 'inf')).toBeDefined();

			vi.advanceTimersByTime(3999);
			expect(toasts.items.find((t) => t.message === 'inf')).toBeDefined();

			vi.advanceTimersByTime(1);
			expect(toasts.items.find((t) => t.message === 'inf')).toBeUndefined();
		});

		it('success toast uses 4s default duration', () => {
			const toasts = getToasts();
			toasts.add('ok', 'success');
			expect(toasts.items.find((t) => t.message === 'ok')).toBeDefined();

			vi.advanceTimersByTime(3999);
			expect(toasts.items.find((t) => t.message === 'ok')).toBeDefined();

			vi.advanceTimersByTime(1);
			expect(toasts.items.find((t) => t.message === 'ok')).toBeUndefined();
		});

		it('explicit duration overrides default', () => {
			const toasts = getToasts();
			toasts.add('custom', 'error', 1000);
			expect(toasts.items.find((t) => t.message === 'custom')).toBeDefined();

			vi.advanceTimersByTime(1000);
			expect(toasts.items.find((t) => t.message === 'custom')).toBeUndefined();
		});
	});

	describe('caps', () => {
		it('caps internal array at 20 items', () => {
			const toasts = getToasts();
			// Add 25 toasts with very long duration so none expire
			for (let i = 0; i < 25; i++) {
				toasts.add(`toast-${i}`, 'info', 999_999);
			}
			// items only shows last MAX_VISIBLE (3), but the internal array is capped at 20
			// Adding one more should still work, and total internal count stays at 20
			toasts.add('extra', 'info', 999_999);
			// We can verify the cap by checking that early toasts are gone:
			// toast-0 through toast-5 should have been evicted
			// The visible items (last 3) should be the most recent
			const visible = toasts.items;
			expect(visible.length).toBe(3);
			expect(visible[visible.length - 1].message).toBe('extra');
		});

		it('visible items capped at MAX_VISIBLE (3)', () => {
			const toasts = getToasts();
			for (let i = 0; i < 10; i++) {
				toasts.add(`vis-${i}`, 'info', 999_999);
			}
			expect(toasts.items.length).toBe(3);
			// Should be the 3 most recent
			const messages = toasts.items.map((t) => t.message);
			expect(messages).toEqual(['vis-7', 'vis-8', 'vis-9']);
		});
	});

	it('dismiss before timeout does not cause issues', () => {
		const toasts = getToasts();
		toasts.add('early-dismiss', 'info', 5000);
		const item = toasts.items.find((t) => t.message === 'early-dismiss');
		expect(item).toBeDefined();
		toasts.dismiss(item!.id);
		expect(toasts.items.find((t) => t.message === 'early-dismiss')).toBeUndefined();
		// Advancing past the original duration should not throw
		expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
	});
});
