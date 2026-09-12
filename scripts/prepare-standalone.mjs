import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
const output = path.resolve('.next/standalone');
await mkdir(path.join(output, '.next'), { recursive: true });
await Promise.all([
  cp('public', path.join(output, 'public'), { recursive: true }),
  cp('.next/static', path.join(output, '.next/static'), { recursive: true }),
  cp('content', path.join(output, 'content'), { recursive: true }),
]);
