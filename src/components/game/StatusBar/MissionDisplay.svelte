<script lang="ts">
	import type { MissionState } from '$lib/types/game';

	interface Props {
		mission: MissionState | null;
	}

	let { mission }: Props = $props();

	const missionText = $derived.by(() => {
		if (!mission) return 'Loading mission...';
		switch (mission.type) {
			case 'TWO_CONTINENTS':
				return 'Conquer 2 continents';
			case 'TWO_CONTINENTS_PLUS_ONE':
				return 'Conquer 2 continents + 1 more';
			case 'EIGHTEEN_TERRITORIES_TWO_TROOPS':
				return 'Hold 18 territories with 2+ troops each';
			case 'TWENTY_FOUR_TERRITORIES':
				return 'Conquer 24 territories';
			case 'ELIMINATE_PLAYER':
				return 'Eliminate a specific player';
			default:
				return 'Unknown mission';
		}
	});
</script>

<div class="rounded-lg bg-surface-700/50 px-3 py-2">
	<div class="mb-1 text-xs font-semibold text-gray-400 uppercase">Mission</div>
	<div class="text-sm">{missionText}</div>
</div>
