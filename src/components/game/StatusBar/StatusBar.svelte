<script lang="ts">
	import type { PlayerState, MissionState } from '$lib/types/game';
	import PlayerList from './PlayerList.svelte';
	import MissionDisplay from './MissionDisplay.svelte';

	interface Props {
		players: PlayerState[];
		currentTurn: number;
		myUserId: string | null;
		mission: MissionState | null;
		connected: boolean;
	}

	let { players, currentTurn, myUserId, mission, connected }: Props = $props();

	let mobileExpanded = $state(false);
</script>

<!-- Desktop sidebar -->
<aside class="glass hidden h-full w-64 flex-col gap-4 rounded-2xl p-4 md:flex">
	<div class="flex items-center gap-2">
		<h2 class="text-sm font-bold uppercase tracking-wider text-gray-400">Players</h2>
		<span
			class="h-2 w-2 rounded-full"
			class:bg-green-500={connected}
			class:bg-red-500={!connected}
			title={connected ? 'Connected' : 'Disconnected'}
		></span>
	</div>

	<PlayerList {players} {currentTurn} {myUserId} />

	<div class="mt-auto">
		<MissionDisplay {mission} />
	</div>
</aside>

<!-- Mobile bottom bar -->
<div class="glass fixed right-0 bottom-0 left-0 z-30 md:hidden">
	<button
		onclick={() => (mobileExpanded = !mobileExpanded)}
		class="flex w-full cursor-pointer items-center justify-between px-4 py-3"
	>
		<div class="flex items-center gap-2">
			<h2 class="text-xs font-bold uppercase tracking-wider text-gray-400">Players</h2>
			<span
				class="h-2 w-2 rounded-full"
				class:bg-green-500={connected}
				class:bg-red-500={!connected}
			></span>
		</div>
		<span class="text-xs text-gray-400">{mobileExpanded ? '▼' : '▲'}</span>
	</button>

	{#if mobileExpanded}
		<div class="max-h-64 overflow-y-auto px-4 pb-4">
			<PlayerList {players} {currentTurn} {myUserId} />
			<div class="mt-3">
				<MissionDisplay {mission} />
			</div>
		</div>
	{/if}
</div>
