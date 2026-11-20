import { spawn } from 'node:child_process';

const OPERATIONS = Object.freeze({
  node_version: Object.freeze({ command: 'node', args: ['--version'] }),
  npm_test: Object.freeze({ command: 'npm', args: ['test'] }),
  npm_build: Object.freeze({ command: 'npm', args: ['run', 'build'] }),
  python_compile: Object.freeze({ command: 'python', args: ['-m', 'compileall', '-q', '.'] })
});

const DEFAULT_TIMEOUT_MS = 30000;
const MAX_TIMEOUT_MS = 60000;
const DEFAULT_OUTPUT_LIMIT = 64 * 1024;
const MAX_OUTPUT_LIMIT = 256 * 1024;

export async function runTask({
  operation,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxOutputBytes = DEFAULT_OUTPUT_LIMIT,
  spawnImpl = spawn
} = {}) {
  const spec = OPERATIONS[operation];
  if (!spec) throw new Error('operation not allowed');

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT_MS) {
    throw new Error('timeout must be between 1 and 60000 milliseconds');
  }
  if (!Number.isSafeInteger(maxOutputBytes) || maxOutputBytes < 1 || maxOutputBytes > MAX_OUTPUT_LIMIT) {
    throw new Error('output limit must be between 1 and 262144 bytes');
  }

  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];
    let outputBytes = 0;
    let timedOut = false;
    let outputExceeded = false;
    let settled = false;
    let killTimer;

    const child = spawnImpl(spec.command, [...spec.args], {
      cwd: process.cwd(),
      env: {
        PATH: process.env.PATH ?? '',
        CI: '1',
        NODE_ENV: 'test'
      },
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const clearTimers = () => {
      clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
    };

    const terminate = () => {
      try {
        child.kill('SIGTERM');
        killTimer = setTimeout(() => {
          if (!settled) child.kill('SIGKILL');
        }, 1000);
        killTimer.unref?.();
      } catch {
        // The process may have exited between the event and the kill signal.
      }
    };

    const collect = (target, chunk) => {
      if (settled || outputExceeded) return;
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      outputBytes += buffer.length;
      if (outputBytes > maxOutputBytes) {
        outputExceeded = true;
        terminate();
        return;
      }
      target.push(buffer);
    };

    child.stdout.on('data', chunk => collect(stdout, chunk));
    child.stderr.on('data', chunk => collect(stderr, chunk));

    child.once('error', error => {
      if (settled) return;
      settled = true;
      clearTimers();
      reject(error);
    });

    child.once('close', code => {
      if (settled) return;
      settled = true;
      clearTimers();

      if (timedOut) return reject(new Error('task timed out'));
      if (outputExceeded) return reject(new Error('task output limit exceeded'));

      resolve({
        code,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8')
      });
    });

    const timeoutTimer = setTimeout(() => {
      if (settled) return;
      timedOut = true;
      terminate();
    }, timeoutMs);
    timeoutTimer.unref?.();
  });
}
