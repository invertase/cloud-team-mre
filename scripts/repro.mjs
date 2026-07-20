import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];

const repros = fs.readdirSync(path.join(root, 'repros'));
if (!slug || !repros.includes(slug)) {
  console.error(`Usage: pnpm repro <slug>\n\nAvailable repros:`);
  for (const r of repros) console.error(`  - ${r}`);
  process.exit(1);
}

const { seed, meta } = await import(
  path.join(root, 'repros', slug, 'seed.mjs')
);
seed();

console.log(`\nSeeded state for: ${meta.title}`);
console.log(`Issue: ${meta.issue}\n`);
console.log(`Once the Dev UI is up, open:\n\n  ${meta.url}\n`);
console.log(`Steps:`);
meta.steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
console.log('');

const child = spawn(
  'npx',
  ['genkit', 'start', '--', 'node', 'fixture/index.mjs'],
  { cwd: root, stdio: 'inherit' }
);
child.on('exit', (code) => process.exit(code ?? 0));
