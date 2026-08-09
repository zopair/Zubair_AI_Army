import { spawn } from 'node:child_process';

const ALLOWED = new Set(['node', 'npm', 'npx', 'docker']);

export function runTask({ command, args = [], cwd = process.cwd(), env = {} }) {
  if (!ALLOWED.has(command)) throw new Error(`command not allowed: ${command}`);
  if (!Array.isArray(args) || args.some(a => typeof a !== 'string')) throw new Error('args must be strings');
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}
