import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execute } from '../skills/hardlook/scripts/process.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = path.join(root, 'skills/hardlook/scripts/hardlook.mjs');
const template = path.join(root, 'skills/hardlook/adapters/opencode/commands/hardlook.md');

async function fixture(t) {
  const dir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'hardlook-command-')));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return { dir, command: path.join(dir, '.config/opencode/commands/hardlook.md') };
}

test('command installer emits the bundled OpenCode command and is idempotent', async (t) => {
  const f = await fixture(t);
  const first = await execute(process.execPath, [cli, 'install-opencode-command', '--dest', f.command]);
  assert.deepEqual(JSON.parse(first.stdout), {
    installed: f.command, command: 'hardlook', source: 'command', restart_harness: true, already_installed: false,
  });
  // The generated command file is the installer's public output contract.
  assert.deepEqual(await fs.readFile(f.command), await fs.readFile(template));
  const before = await fs.stat(f.command);
  const second = await execute(process.execPath, [cli, 'install-opencode-command', '--dest', f.command]);
  assert.equal(JSON.parse(second.stdout).already_installed, true);
  assert.equal((await fs.stat(f.command)).mtimeMs, before.mtimeMs);
});

test('command installer preserves an existing customized command', async (t) => {
  const f = await fixture(t);
  await fs.mkdir(path.dirname(f.command), { recursive: true });
  const custom = '---\ndescription: My customized review\n---\nKeep my review workflow.\n';
  await fs.writeFile(f.command, custom);
  const result = await execute(process.execPath, [cli, 'install-opencode-command', '--dest', f.command], { allowFailure: true });
  assert.equal(result.code, 2);
  assert.equal(result.stdout, '');
  assert.equal(await fs.readFile(f.command, 'utf8'), custom);
});

test('command installer preserves symlinks and their targets', async (t) => {
  const f = await fixture(t);
  await fs.mkdir(path.dirname(f.command), { recursive: true });
  const existing = path.join(f.dir, 'existing.md');
  await fs.copyFile(template, existing);
  await fs.symlink(existing, f.command);
  const result = await execute(process.execPath, [cli, 'install-opencode-command', '--dest', f.command], { allowFailure: true });
  assert.equal(result.code, 2);
  assert.equal(await fs.readlink(f.command), existing);
  assert.deepEqual(await fs.readFile(existing), await fs.readFile(template));
});

test('a relocated installed bundle registers a project-local command without its checkout', async (t) => {
  const f = await fixture(t);
  const installed = path.join(f.dir, 'installed/hardlook');
  await execute(process.execPath, [cli, 'install', '--dest', installed]);
  const relocated = path.join(f.dir, 'relocated/hardlook');
  await fs.mkdir(path.dirname(relocated));
  await fs.rename(installed, relocated);
  const relocatedTemplate = path.join(relocated, 'adapters/opencode/commands/hardlook.md');
  const commandDocument = '---\ndescription: Relocated command fixture\n---\nReview request: $ARGUMENTS\n';
  await fs.writeFile(relocatedTemplate, commandDocument);
  const project = path.join(f.dir, 'project');
  await fs.mkdir(project);
  const result = await execute(process.execPath, [path.join(relocated, 'scripts/hardlook.mjs'),
    'install-opencode-command', '--dest', '.opencode/commands/hardlook.md'], { cwd: project });
  assert.equal(JSON.parse(result.stdout).installed, path.join(project, '.opencode/commands/hardlook.md'));
  assert.equal(await fs.readFile(path.join(project, '.opencode/commands/hardlook.md'), 'utf8'), commandDocument);
});

test('command installer rejects missing, misnamed, and inside-bundle destinations before writing', async (t) => {
  const f = await fixture(t);
  const installed = path.join(f.dir, 'hardlook');
  await execute(process.execPath, [cli, 'install', '--dest', installed]);
  const installedCLI = path.join(installed, 'scripts/hardlook.mjs');
  const missing = await execute(process.execPath, [installedCLI, 'install-opencode-command'], { allowFailure: true });
  assert.equal(missing.code, 2);
  assert.equal(missing.stdout, '');
  const wrong = path.join(f.dir, 'commands/review.md');
  const misnamed = await execute(process.execPath, [installedCLI, 'install-opencode-command', '--dest', wrong], { allowFailure: true });
  assert.equal(misnamed.code, 2);
  await assert.rejects(fs.access(path.dirname(wrong)));
  const nested = path.join(installed, 'commands/hardlook.md');
  const inside = await execute(process.execPath, [installedCLI, 'install-opencode-command', '--dest', nested], { allowFailure: true });
  assert.equal(inside.code, 2);
  assert.equal(inside.stdout, '');
  await assert.rejects(fs.access(path.dirname(nested)));
});
