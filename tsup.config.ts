import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig([
  {
    platform: 'node',
    format: ['cjs', 'esm'],
    entry: {
      index: './src/index.ts',
    },
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
  },
  {
    platform: 'browser',
    format: ['esm'],
    entry: {
      browser: './src/index.ts',
    },
    dts: false,
    shims: true,
    skipNodeModulesBundle: true,
    clean: false, // Do not clean the dist folder again
    esbuildPlugins: [
      {
        name: 'replace-data-loader',
        setup(build) {
          build.onResolve({ filter: /^\.\.\/utils\/data-loader$/ }, (args) => {
            const newPath = path.resolve(args.resolveDir, args.path + '.browser.ts');
            return { path: newPath };
          });
        },
      },
    ],
  },
]);