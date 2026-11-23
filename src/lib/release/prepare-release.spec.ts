import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve(__dirname, '../../../scripts/prepare-release.mjs');
const files = ['manifest.json', 'package.json', 'package-lock.json', 'versions.json'];

describe('prepare release command', () => {
  let directory: string;

  const readJson = (name: string) => JSON.parse(readFileSync(join(directory, name), 'utf8'));
  const writeJson = (name: string, data: unknown) =>
    writeFileSync(join(directory, name), `${JSON.stringify(data, null, 2)}\n`);
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [script, ...args], { cwd: directory, encoding: 'utf8' });

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'prepare-release-test-'));
    writeJson('manifest.json', {
      id: 'week-calendart',
      version: '1.2.3',
      minAppVersion: '1.5.0',
      name: 'Calendar',
    });
    writeJson('package.json', { name: 'calendar', version: '1.2.3', scripts: { test: 'jest' } });
    writeJson('package-lock.json', {
      version: '1.2.3',
      lockfileVersion: 3,
      packages: { '': { version: '1.2.3' }, dependency: { version: '9.8.7' } },
    });
    writeJson('versions.json', { '1.2.3': '1.5.0' });
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it.each([
    ['patch', '1.2.4'],
    ['minor', '1.3.0'],
    ['major', '2.0.0'],
  ])('prepares a %s release as %s without committing, tagging or pushing', (part, expected) => {
    const result = run(part);

    expect(result.status).toBe(0);
    expect(readJson('manifest.json')).toEqual({
      id: 'week-calendart',
      version: expected,
      minAppVersion: '1.5.0',
      name: 'Calendar',
    });
    expect(readJson('package.json')).toEqual({
      name: 'calendar',
      version: expected,
      scripts: { test: 'jest' },
    });
    expect(readJson('package-lock.json')).toEqual({
      version: expected,
      lockfileVersion: 3,
      packages: { '': { version: expected }, dependency: { version: '9.8.7' } },
    });
    expect(readJson('versions.json')).toEqual({ '1.2.3': '1.5.0', [expected]: '1.5.0' });
    expect(readdirSync(directory).sort()).toEqual([...files].sort());
    expect(result.stdout).toContain(`Prepared release ${expected}`);
  });

  it('uses the manifest as the source of truth for legacy, inconsistent alpha versions', () => {
    writeJson('manifest.json', { ...readJson('manifest.json'), version: 'v0.2.1-alpha' });
    writeJson('package.json', { ...readJson('package.json'), version: '0.2.0-alpha' });

    expect(run('patch').status).toBe(0);
    expect(readJson('manifest.json').version).toBe('0.2.2');
    expect(readJson('package.json').version).toBe('0.2.2');
  });

  it('uses the configured minimum Obsidian version in the compatibility mapping', () => {
    writeJson('manifest.json', { ...readJson('manifest.json'), minAppVersion: '1.8.0' });

    expect(run('minor').status).toBe(0);
    expect(readJson('versions.json')['1.3.0']).toBe('1.8.0');
  });

  it.each([[], ['invalid'], ['patch', 'extra']])(
    'rejects invalid arguments %j without changing files',
    (...args) => {
      const original = files.map((name) => readFileSync(join(directory, name), 'utf8'));

      expect(run(...args).status).not.toBe(0);
      expect(files.map((name) => readFileSync(join(directory, name), 'utf8'))).toEqual(original);
    },
  );

  it.each([
    ['manifest.json', { version: 'not-a-version', minAppVersion: '1.5.0' }],
    ['manifest.json', { version: '1.2.3' }],
    ['package-lock.json', { version: '1.2.3' }],
  ])('rejects invalid metadata in %s before writing any files', (name, data) => {
    writeJson(name, data);
    const original = files.map((file) => readFileSync(join(directory, file), 'utf8'));

    expect(run('patch').status).not.toBe(0);
    expect(files.map((file) => readFileSync(join(directory, file), 'utf8'))).toEqual(original);
  });
});
