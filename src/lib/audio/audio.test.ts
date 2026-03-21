import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('audio system', () => {
	let audioModule: typeof import('./audio.svelte');

	beforeEach(async () => {
		vi.resetModules();
		// Re-setup AudioContext mock after resetModules
		const mockOscillator = {
			type: 'sine',
			frequency: { setValueAtTime: vi.fn() },
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn()
		};
		const mockGainNode = {
			gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
			connect: vi.fn()
		};
		globalThis.AudioContext = vi.fn().mockImplementation(() => ({
			currentTime: 0,
			destination: {},
			createOscillator: vi.fn().mockReturnValue({ ...mockOscillator }),
			createGain: vi.fn().mockReturnValue({ ...mockGainNode })
		})) as unknown as typeof AudioContext;

		audioModule = await import('./audio.svelte');
	});

	it('enabled defaults to true', () => {
		expect(audioModule.audio.enabled).toBe(true);
	});

	it('toggle flips enabled', () => {
		audioModule.audio.toggle();
		expect(audioModule.audio.enabled).toBe(false);
		audioModule.audio.toggle();
		expect(audioModule.audio.enabled).toBe(true);
	});

	it('play functions create oscillator when enabled', () => {
		audioModule.playDeploy();
		expect(globalThis.AudioContext).toHaveBeenCalled();
	});

	it('play functions do nothing when disabled', () => {
		audioModule.audio.toggle(); // disable
		const callCount = (globalThis.AudioContext as unknown as ReturnType<typeof vi.fn>).mock.calls
			.length;
		audioModule.playDeploy();
		// AudioContext should not be called again
		expect((globalThis.AudioContext as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
			callCount
		);
	});

	it('all play functions execute without error', () => {
		expect(() => audioModule.playDeploy()).not.toThrow();
		expect(() => audioModule.playAttack()).not.toThrow();
		expect(() => audioModule.playConquer()).not.toThrow();
		expect(() => audioModule.playTurnStart()).not.toThrow();
		expect(() => audioModule.playCardPlay()).not.toThrow();
		expect(() => audioModule.playVictory()).not.toThrow();
		expect(() => audioModule.playDefeat()).not.toThrow();
	});

	it('AudioContext creation failure does not throw', async () => {
		vi.resetModules();
		globalThis.AudioContext = vi.fn().mockImplementation(() => {
			throw new Error('Not supported');
		}) as unknown as typeof AudioContext;
		const mod = await import('./audio.svelte');
		expect(() => mod.playDeploy()).not.toThrow();
	});

	describe('localStorage persistence', () => {
		it('reads audio-enabled=false from localStorage on init', async () => {
			vi.resetModules();
			localStorage.setItem('audio-enabled', 'false');
			const mod = await import('./audio.svelte');
			expect(mod.audio.enabled).toBe(false);
		});

		it('defaults to true when localStorage has no key', async () => {
			vi.resetModules();
			localStorage.removeItem('audio-enabled');
			const mod = await import('./audio.svelte');
			expect(mod.audio.enabled).toBe(true);
		});

		it('toggle() writes to localStorage', () => {
			audioModule.audio.toggle();
			expect(localStorage.getItem('audio-enabled')).toBe('false');
			audioModule.audio.toggle();
			expect(localStorage.getItem('audio-enabled')).toBe('true');
		});

		it('persists across module reloads', async () => {
			audioModule.audio.toggle(); // default true → false
			expect(audioModule.audio.enabled).toBe(false);

			vi.resetModules();
			const mod = await import('./audio.svelte');
			expect(mod.audio.enabled).toBe(false);
		});
	});
});
