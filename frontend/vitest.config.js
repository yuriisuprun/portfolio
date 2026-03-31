import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Keep thresholds modest for now; raise once the suite grows.
      thresholds: {
        lines: 40,
        functions: 30,
        branches: 30,
        statements: 40,
      },
    },
  },
});

