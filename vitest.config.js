import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['packages/ui/src/**/*.test.{ts,tsx}'],
  },
});
