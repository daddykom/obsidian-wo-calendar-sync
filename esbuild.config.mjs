import * as esbuild from 'esbuild';

const production = process.argv.includes('production');

const options = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  format: 'cjs',
  platform: 'browser',
  sourcemap: !production,

  external: ['obsidian'],
};

if (production) {
  await esbuild.build(options);
} else {
  const context = await esbuild.context(options);
  await context.watch();
}
