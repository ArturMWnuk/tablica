import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'app/src/**/*.test.ts',
      'packages/*/src/**/*.test.ts',
      'scripts/**/*.test.ts',
      'tools/**/*.test.ts',
    ],
    environment: 'node',
  },
});
