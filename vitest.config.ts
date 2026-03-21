import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			'$env/static/public': path.resolve('./src/lib/__mocks__/env.ts')
		}
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/lib/__mocks__/setup.ts'],
		include: ['src/**/*.test.ts']
	}
});
