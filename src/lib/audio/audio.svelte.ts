let ctx: AudioContext | null = null;
let enabled = $state(
	typeof localStorage !== 'undefined' ? localStorage.getItem('audio-enabled') !== 'false' : true
);

function getContext(): AudioContext {
	if (!ctx) {
		ctx = new AudioContext();
	}
	return ctx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) {
	if (!enabled) return;
	try {
		const ac = getContext();
		const osc = ac.createOscillator();
		const gainNode = ac.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(frequency, ac.currentTime);
		gainNode.gain.setValueAtTime(gain, ac.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

		osc.connect(gainNode);
		gainNode.connect(ac.destination);
		osc.start();
		osc.stop(ac.currentTime + duration);
	} catch {
		// Audio not available
	}
}

export function playDeploy() {
	playTone(520, 0.12, 'square', 0.1);
}

export function playAttack() {
	// Quick percussive burst
	playTone(200, 0.08, 'sawtooth', 0.12);
	setTimeout(() => playTone(150, 0.06, 'sawtooth', 0.1), 80);
}

export function playConquer() {
	// Ascending fanfare
	playTone(440, 0.15, 'triangle', 0.12);
	setTimeout(() => playTone(554, 0.15, 'triangle', 0.12), 120);
	setTimeout(() => playTone(659, 0.25, 'triangle', 0.15), 240);
}

export function playTurnStart() {
	// Two-tone chime
	playTone(660, 0.2, 'sine', 0.1);
	setTimeout(() => playTone(880, 0.3, 'sine', 0.12), 150);
}

export function playCardPlay() {
	playTone(600, 0.1, 'triangle', 0.1);
	setTimeout(() => playTone(750, 0.15, 'triangle', 0.1), 80);
}

export function playVictory() {
	const notes = [523, 659, 784, 1047];
	notes.forEach((freq, i) => {
		setTimeout(() => playTone(freq, 0.3, 'triangle', 0.12), i * 200);
	});
}

export function playDefeat() {
	playTone(300, 0.4, 'sine', 0.1);
	setTimeout(() => playTone(250, 0.5, 'sine', 0.1), 300);
}

export const audio = {
	get enabled() {
		return enabled;
	},
	toggle() {
		enabled = !enabled;
		localStorage.setItem('audio-enabled', String(enabled));
	}
};
