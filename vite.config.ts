import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: './',
  server: {
    port: 5173,
    host: true, // Permet de tester facilement depuis un iPhone/iPad sur le même réseau WiFi
  },
});

