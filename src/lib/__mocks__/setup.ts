import { vi } from 'vitest';

// Mock $lib/config/supabase — auth.svelte.ts imports this at module level
vi.mock('$lib/config/supabase', () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
			onAuthStateChange: vi
				.fn()
				.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
			signInWithPassword: vi.fn(),
			signInWithIdToken: vi.fn(),
			signUp: vi.fn(),
			signOut: vi.fn()
		}
	}
}));

// Stub globalThis.AudioContext for audio tests
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
	createOscillator: vi.fn().mockReturnValue(mockOscillator),
	createGain: vi.fn().mockReturnValue(mockGainNode)
})) as unknown as typeof AudioContext;
