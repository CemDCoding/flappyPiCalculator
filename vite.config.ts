/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: 'localhost' },
  test: { environment: 'jsdom' },
});
