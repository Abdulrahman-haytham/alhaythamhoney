import fs from 'node:fs/promises';
import path from 'node:path';

const distPath = path.resolve(process.cwd(), 'dist');

await fs.rm(distPath, { recursive: true, force: true });

