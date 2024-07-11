import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    plugins: [
        sveltekit(),
        nodePolyfills(),
    ],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    resolve: {
        preserveSymlinks: true
    },
    server: {
        fs: {
            allow: ['./wasm_utils/pkg/']
        },
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        }
    }
});
