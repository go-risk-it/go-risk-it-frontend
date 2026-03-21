import { api } from './client';
import type {
	DeployMove,
	AttackMove,
	ConquerMove,
	ReinforceMove,
	AdvanceMove,
	CardMove
} from '$lib/types/moves';

export function deploy(gameId: number, move: DeployMove) {
	return api.post(`/games/${gameId}/moves/deployments`, move);
}

export function attack(gameId: number, move: AttackMove) {
	return api.post(`/games/${gameId}/moves/attacks`, move);
}

export function conquer(gameId: number, move: ConquerMove) {
	return api.post(`/games/${gameId}/moves/conquers`, move);
}

export function reinforce(gameId: number, move: ReinforceMove) {
	return api.post(`/games/${gameId}/moves/reinforcements`, move);
}

export function advance(gameId: number, move: AdvanceMove) {
	return api.post(`/games/${gameId}/advancements`, move);
}

export function playCards(gameId: number, move: CardMove) {
	return api.post(`/games/${gameId}/moves/cards`, move);
}
