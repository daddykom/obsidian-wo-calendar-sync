import * as esbuild from 'esbuild';

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  format: 'cjs',
  platform: 'browser',
  sourcemap: true,

  external: ['obsidian'],
});

await context.watch();
