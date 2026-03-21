import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdd = vi.fn();

vi.mock('$lib/state/toast.svelte', () => ({
	getToasts: vi.fn(() => ({
		items: [],
		add: mockAdd,
		dismiss: vi.fn()
	}))
}));

const { useAction } = await import('./use-action.svelte');

describe('useAction', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('starts with no error and not submitting', () => {
		const action = useAction();
		expect(action.error).toBe('');
		expect(action.submitting).toBe(false);
	});

	it('sets submitting during run', async () => {
		const action = useAction();
		let wasSubmitting = false;
		await action.run(async () => {
			wasSubmitting = action.submitting;
		}, 'fallback');
		expect(wasSubmitting).toBe(true);
	});

	it('clears submitting after successful run', async () => {
		const action = useAction();
		await action.run(async () => {}, 'fallback');
		expect(action.submitting).toBe(false);
	});

	it('clears submitting after failed run', async () => {
		const action = useAction();
		await action.run(async () => {
			throw new Error('boom');
		}, 'fallback');
		expect(action.submitting).toBe(false);
	});

	it('sets error from Error.message on failure', async () => {
		const action = useAction();
		await action.run(async () => {
			throw new Error('boom');
		}, 'fallback');
		expect(action.error).toBe('boom');
	});

	it('uses fallback message for non-Error', async () => {
		const action = useAction();
		await action.run(async () => {
			throw 'string error';
		}, 'something went wrong');
		expect(action.error).toBe('something went wrong');
	});

	it('adds error toast on failure', async () => {
		const action = useAction();
		await action.run(async () => {
			throw new Error('toast-msg');
		}, 'fallback');
		expect(mockAdd).toHaveBeenCalledWith('toast-msg', 'error');
	});

	it('clears previous error on new run', async () => {
		const action = useAction();
		await action.run(async () => {
			throw new Error('first');
		}, 'fallback');
		expect(action.error).toBe('first');

		// Start a new successful run — error should be cleared
		await action.run(async () => {}, 'fallback');
		expect(action.error).toBe('');
	});
});
