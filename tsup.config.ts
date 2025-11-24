import { defineConfig } from 'tsup';
import path from 'path';

const baseConfig = {
  shims: true,
  skipNodeModulesBundle: true,
  dts: true,
};

export default defineConfig((options) => [
  {
    ...baseConfig,
    platform: 'node',
    format: ['cjs', 'esm'],
    entry: {
      index: './src/index.ts',
    },
    clean: !options.watch,
  },
  {
    ...baseConfig,
    platform: 'browser',
    format: ['esm'],
    entry: {
      browser: './src/index.ts',
    },
    dts: false,
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
    clean: false, // Do not clean the dist folder again
  },
]);