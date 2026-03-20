<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuth } from '$lib/state/auth.svelte';

	const auth = getAuth();

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (!auth.loading && auth.isAuthenticated) {
			goto('/');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		submitting = true;
		try {
			await auth.signUp({ email, password });
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Sign up failed';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex min-h-dvh items-center justify-center">
	<div class="glass w-full max-w-sm rounded-2xl p-8">
		<h1 class="mb-6 text-center text-2xl font-bold">Sign Up</h1>

		{#if error}
			<div class="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
				{error}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="email" class="mb-1 block text-sm text-gray-400">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full rounded-lg bg-surface-700 px-4 py-2.5 text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-accent"
					placeholder="player@go-risk.it"
				/>
			</div>
			<div>
				<label for="password" class="mb-1 block text-sm text-gray-400">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength="6"
					class="w-full rounded-lg bg-surface-700 px-4 py-2.5 text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-accent"
				/>
			<p class="mt-1 text-xs text-gray-500">At least 6 characters</p>
			</div>
			<div>
				<label for="confirmPassword" class="mb-1 block text-sm text-gray-400"
					>Confirm Password</label
				>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					required
					minlength="6"
					class="w-full rounded-lg bg-surface-700 px-4 py-2.5 text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-accent"
				/>
			</div>
			<button
				type="submit"
				disabled={submitting}
				data-testid="signup-submit"
				class="w-full cursor-pointer rounded-lg bg-accent py-2.5 font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
			>
				{submitting ? 'Creating account...' : 'Sign Up'}
			</button>
		</form>

		<p class="mt-4 text-center text-sm text-gray-500">
			Already have an account?
			<a href="/auth/signin" class="text-accent-light hover:underline">Sign in</a>
		</p>
	</div>
</div>
