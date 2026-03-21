<script lang="ts">
	/**
	 * Game page route that renders the GameBoard for a specific game ID from the URL.
	 * Enforces two guards: redirects to sign-in if unauthenticated, and redirects to
	 * the home page if the game ID is not a valid number.
	 */
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getAuth } from '$lib/state/auth.svelte';
	import GameBoard from '../../../components/game/GameBoard.svelte';

	const auth = getAuth();
	const gameId = $derived($page.params.id);

	// Auth guard: redirect unauthenticated users to sign-in
	$effect(() => {
		if (!auth.loading && !auth.isAuthenticated) {
			goto('/auth/signin');
		}
	});

	// Validate that the game ID is numeric; redirect to home if not
	$effect(() => {
		if (gameId && isNaN(Number(gameId))) {
			goto('/');
		}
	});
</script>

{#if auth.loading}
	<div class="flex min-h-dvh items-center justify-center">
		<div
			class="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
		></div>
	</div>
{:else if auth.isAuthenticated && gameId}
	<GameBoard {gameId} />
{/if}
