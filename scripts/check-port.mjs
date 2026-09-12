import net from 'node:net';
import { spawn } from 'node:child_process';

const mode = process.argv[2] === 'start' ? 'start' : 'dev';
const basePort = 3005;

function isFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => tester.close(() => resolve(true)));
    tester.listen(port, '0.0.0.0');
  });
}

async function findPort() {
  for (let port = basePort; port < basePort + 10; port++) {
    if (await isFree(port)) return port;
  }
  return basePort;
}

const port = await findPort();
if (port !== basePort) {
  console.log(`[check-port] المنفذ ${basePort} مشغول — التشغيل على ${port} بدلاً منه.`);
}

const child =
  mode === 'start'
    ? spawn(process.execPath, ['--env-file-if-exists=.env', 'scripts/start.mjs'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: String(port) },
      })
    : spawn('npx', ['next', 'dev', '-p', String(port)], { stdio: 'inherit', shell: false });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
