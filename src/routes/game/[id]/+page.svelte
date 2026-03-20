<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getAuth } from '$lib/state/auth.svelte';
	import GameBoard from '../../../components/game/GameBoard.svelte';

	const auth = getAuth();
	const gameId = $derived($page.params.id);

	$effect(() => {
		if (!auth.loading && !auth.isAuthenticated) {
			goto('/auth/signin');
		}
	});
</script>

{#if auth.loading}
	<div class="flex min-h-dvh items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent">
		</div>
	</div>
{:else if auth.isAuthenticated && gameId}
	<GameBoard {gameId} />
{/if}
