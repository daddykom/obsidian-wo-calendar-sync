import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const workflow = readFileSync(resolve(__dirname, '../../../.github/workflows/release.yml'), 'utf8');
const validation = workflow.match(/node --input-type=module <<'NODE'\n([\s\S]*?)\n\s+NODE/)![1];

describe('release workflow version detection', () => {
  let directory: string;
  const output = () => readFileSync(join(directory, 'output'), 'utf8');
  const run = (responses: { status: number; draft?: boolean }[]) => {
    const mock = `
      const responses = ${JSON.stringify(responses)};
      globalThis.fetch = async (url, options) => {
        if (!url.startsWith('https://example.invalid/repos/owner/repo/')) throw new Error('Unexpected URL');
        if (options.headers.Authorization !== 'Bearer test-token') throw new Error('Missing authentication');
        const response = responses.shift();
        if (!response) throw new Error('Unexpected API call');
        return { status: response.status, ok: response.status === 200, json: async () => response };
      };
    `;
    return spawnSync(process.execPath, ['--input-type=module', '--eval', mock + validation], {
      cwd: directory,
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_API_URL: 'https://example.invalid',
        GITHUB_REPOSITORY: 'owner/repo',
        GH_TOKEN: 'test-token',
        GITHUB_OUTPUT: join(directory, 'output'),
      },
    });
  };

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'release-workflow-test-'));
    const metadata = {
      'manifest.json': { version: '1.2.3', minAppVersion: '1.5.0' },
      'package.json': { version: '1.2.3' },
      'package-lock.json': { version: '1.2.3', packages: { '': { version: '1.2.3' } } },
      'versions.json': { '1.2.3': '1.5.0' },
    };
    for (const [name, data] of Object.entries(metadata)) {
      writeFileSync(join(directory, name), JSON.stringify(data));
    }
    writeFileSync(join(directory, 'output'), '');
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it('publishes a new version when neither its release nor its tag exists', () => {
    expect(run([{ status: 404 }, { status: 404 }]).status).toBe(0);
    expect(output()).toBe('version=1.2.3\npublish=true\n');
  });

  it('skips an already published version', () => {
    expect(run([{ status: 200, draft: false }]).status).toBe(0);
    expect(output()).toBe('version=1.2.3\npublish=false\n');
  });

  it.each([401, 403, 500])('does not mistake HTTP %s for a missing release', (status) => {
    expect(run([{ status }]).status).not.toBe(0);
    expect(output()).toBe('');
  });

  it('does not publish over an existing draft', () => {
    expect(run([{ status: 200, draft: true }]).status).not.toBe(0);
    expect(output()).toBe('');
  });

  it('does not reuse a tag without a release, which could point to a different commit', () => {
    expect(run([{ status: 404 }, { status: 200 }]).status).not.toBe(0);
    expect(output()).toBe('');
  });

  it('rejects inconsistent versions before contacting GitHub', () => {
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ version: '1.2.2' }));

    expect(run([]).status).not.toBe(0);
    expect(output()).toBe('');
  });
});
