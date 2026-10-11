#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { packet } from './context.mjs';
import { doctor } from './adapters.mjs';
import { review } from './review.mjs';
import { pipelineReport } from './report.mjs';
import { cancelExecutions } from './process.mjs';

const help = `Hardlook — one self-contained review skill (Node 22+, Git)

  hardlook.mjs doctor [--binary harness=/absolute/cli]
  hardlook.mjs install --dest <unused exact skill directory>
  hardlook.mjs install-opencode-command --dest <commands/hardlook.md>
  hardlook.mjs context --repo <repo> --intent <intent> [scope options]
  hardlook.mjs review --repo <repo> --intent <intent> --peer <harness>[:model]

Scope: --scope branch|staged|uncommitted (default branch), --base <ref>,
       --include <repo-relative-file> (repeat), --max-bytes <bytes> (default 524288)
Review: --mode routine|deep|structure, --peer <harness>:<model> (repeat),
        --lead <harness>:<model>, --timeout-ms <ms> (default 300000),
        --format json|no-mistakes (default json), --binary harness=<path> (repeat)

Harnesses: opencode, claude-code, cursor, pi, codex.
Deep mode needs 2-4 distinct explicit selectors. No automatic model fallback.
Reports go to stdout; prompts and raw CLI diagnostics are not logged.
Review exit: 0 complete without act-on issues, 1 complete with act-on issues/high risk,
             2 invalid request or incomplete/partial review. No code fixes.
`;

function number(text, fallback) {
  if (text === undefined) return fallback;
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text)) || Number(text) < 1) throw new Error('invalid positive limit');
  return Number(text);
}

export async function install(destination) {
  if (!destination) throw new Error('--dest is required');
  const source = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
  const target = path.resolve(destination);
  if (target === source || target.startsWith(`${source}${path.sep}`)) throw new Error('installation destination cannot be inside source bundle');
  try { await fs.lstat(target); throw new Error('destination already exists'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true, errorOnExist: true, force: false, verbatimSymlinks: true });
  return { installed: target, complete_bundle: true, restart_harness: true };
}

export async function installOpencodeCommand(destination) {
  if (!destination) throw new Error('--dest is required');
  const source = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
  const target = path.resolve(destination);
  if (path.basename(target) !== 'hardlook.md') throw new Error('command destination must be named hardlook.md');
  if (target.startsWith(`${source}${path.sep}`)) throw new Error('installation destination cannot be inside source bundle');
  const template = await fs.readFile(path.join(source, 'adapters/opencode/commands/hardlook.md'), 'utf8');
  const result = { installed: target, command: 'hardlook', source: 'command', restart_harness: true };
  try {
    const existing = await fs.lstat(target);
    if (existing.isFile() && await fs.readFile(target, 'utf8') === template) return { ...result, already_installed: true };
    throw new Error('command destination already exists');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, template, { encoding: 'utf8', flag: 'wx' });
  return { ...result, already_installed: false };
}

export async function main(args) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: {
    help: { type: 'boolean', short: 'h' }, repo: { type: 'string' }, scope: { type: 'string' }, base: { type: 'string' },
    intent: { type: 'string' }, mode: { type: 'string' }, peer: { type: 'string', multiple: true }, lead: { type: 'string' },
    include: { type: 'string', multiple: true }, binary: { type: 'string', multiple: true }, dest: { type: 'string' },
    format: { type: 'string' }, 'timeout-ms': { type: 'string' }, 'max-bytes': { type: 'string' },
  } });
  if (values.help || !positionals.length) { process.stdout.write(help); return 0; }
  if (positionals.length !== 1) throw new Error('unexpected positional arguments');
  const binaryOverrides = Object.fromEntries((values.binary ?? []).map((entry) => {
    const split = entry.indexOf('=');
    if (split < 1 || split === entry.length - 1) throw new Error('invalid binary override');
    return [entry.slice(0, split), entry.slice(split + 1)];
  }));
  const options = {
    repo: values.repo ?? process.cwd(), scope: values.scope ?? 'branch', base: values.base,
    intent: values.intent, include: values.include ?? [], peers: values.peer,
    mode: values.mode, lead: values.lead, binaryOverrides,
    timeoutMs: number(values['timeout-ms'], 300_000), maxBytes: number(values['max-bytes'], 524_288),
  };
  let result;
  let code = 0;
  switch (positionals[0]) {
    case 'doctor': result = await doctor(binaryOverrides); break;
    case 'install': result = await install(values.dest); break;
    case 'install-opencode-command': result = await installOpencodeCommand(values.dest); break;
    case 'context': result = await packet(options); break;
    case 'review': {
      const format = values.format ?? 'json';
      if (!['json', 'no-mistakes'].includes(format)) throw new Error('invalid report format');
      const reviewResult = await review(options);
      if (reviewResult.status !== 'complete') code = 2;
      else if (reviewResult.report.risk_level === 'high' || reviewResult.report.findings.some((item) => item.judgment === 'act-on' && item.severity !== 'info')) code = 1;
      result = format === 'no-mistakes' ? pipelineReport(reviewResult) : reviewResult;
      break;
    }
    default: throw new Error('unknown command');
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return code;
}

const entryPath = process.argv[1] ? await fs.realpath(process.argv[1]).catch(() => null) : null;
if (entryPath === await fs.realpath(fileURLToPath(import.meta.url))) {
  let cancellationCode = null;
  const interrupt = () => { cancellationCode = 130; cancelExecutions(); };
  const terminate = () => { cancellationCode = 143; cancelExecutions(); };
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', terminate);
  try { process.exitCode = await main(process.argv.slice(2)); }
  catch (error) {
    // Errors generated here are descriptive; external errors carry content-free kinds.
    const reason = error.kind ?? (error.code ? 'filesystem-or-runtime-error' : error.message);
    process.stderr.write(`${JSON.stringify({ status: 'incomplete', reason })}\n`);
    process.exitCode = 2;
  } finally {
    if (cancellationCode !== null) process.exitCode = cancellationCode;
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', terminate);
  }
}
