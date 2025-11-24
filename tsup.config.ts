import { defineConfig } from 'tsup';

export default defineConfig({
  platform: 'node',
  format: ['cjs', 'esm'],
  entry: {
    index: './src/index.ts',
  },
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
});
