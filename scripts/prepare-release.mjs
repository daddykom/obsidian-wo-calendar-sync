import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [part, ...extra] = process.argv.slice(2);
if (!['patch', 'minor', 'major'].includes(part) || extra.length) {
  console.error('Usage: npm run release -- patch|minor|major');
  process.exit(1);
}

try {
  const paths = ['manifest.json', 'package.json', 'package-lock.json', 'versions.json'];
  const [manifest, pkg, lock, versions] = paths.map((file) =>
    JSON.parse(readFileSync(resolve(file), 'utf8')),
  );
  const match = manifest.version.match(
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*)?(?:\+[\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*)?$/,
  );
  if (!match) throw new Error(`Invalid manifest version: ${manifest.version}`);
  if (typeof manifest.minAppVersion !== 'string' || !manifest.minAppVersion) {
    throw new Error('manifest.json must contain minAppVersion.');
  }
  if (!lock.packages?.['']) throw new Error('package-lock.json must contain its root package.');

  const numbers = match.slice(1, 4).map(Number);
  const index = { major: 0, minor: 1, patch: 2 }[part];
  numbers[index]++;
  numbers.fill(0, index + 1);
  if (!numbers.every(Number.isSafeInteger)) throw new Error('Version numbers are too large.');
  const version = numbers.join('.');

  manifest.version = version;
  pkg.version = version;
  lock.version = version;
  lock.packages[''].version = version;
  versions[version] = manifest.minAppVersion;

  [manifest, pkg, lock, versions].forEach((data, index) => {
    writeFileSync(resolve(paths[index]), `${JSON.stringify(data, null, 2)}\n`);
  });
  console.log(`Prepared release ${version}. Review, commit, push and merge these four files.`);
  console.log('No commit, tag, push or release was created.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
