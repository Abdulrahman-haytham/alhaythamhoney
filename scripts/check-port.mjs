import net from "node:net";
import { spawn } from "node:child_process";

const mode = process.argv[2] === "start" ? "start" : "dev";
const basePort = 3005;

function isFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => tester.close(() => resolve(true)));
    tester.listen(port, "0.0.0.0");
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

const args = mode === "start" ? ["next", "start", "-p", String(port)] : ["next", "dev", "-p", String(port)];
const child = spawn("npx", args, { stdio: "inherit", shell: false });
child.on("exit", (code) => process.exit(code ?? 0));
