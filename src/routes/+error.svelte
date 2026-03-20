<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
	<h1 class="text-6xl font-bold text-accent">{$page.status}</h1>
	<p class="text-lg text-gray-400">{$page.error?.message ?? 'Something went wrong'}</p>
	<a
		href="/"
		class="mt-4 rounded-lg bg-accent px-6 py-2 text-sm font-semibold transition-colors hover:bg-accent-light"
	>
		Back to Home
	</a>
</div>
