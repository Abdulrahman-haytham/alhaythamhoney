import './validate-env.mjs';
import { spawn } from 'node:child_process';
import path from 'node:path';
const child = spawn(process.execPath, ['.next/standalone/server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || '3005',
    HOSTNAME: '127.0.0.1',
    UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR || 'data/uploads'),
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 1));
