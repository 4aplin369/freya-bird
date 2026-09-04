import { readFile, stat } from 'node:fs/promises';
import { strict as assert } from 'node:assert';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

assert.ok(script, 'inline game script is present');
new Function(script);

for (const id of ['go', 'calm', 'fishMode', 'home', 'sound']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `control #${id} is present`);
}

for (const mode of ['hunt', 'calm', 'fish']) {
  assert.ok(html.includes(`play('${mode}')`), `${mode} mode is wired`);
}

for (const asset of ['feather.png', 'fish.png']) {
  const file = await stat(new URL(`../${asset}`, import.meta.url));
  assert.ok(file.size > 0, `${asset} is non-empty`);
  assert.ok(html.includes(asset), `${asset} is referenced by the page`);
}

assert.ok(html.includes('user-scalable=no'), 'iPad zoom guard is retained');
assert.ok(html.includes("visibilitychange"), 'background audio lifecycle is handled');

console.log('Freya Bird smoke test passed: boot script, 3 modes, controls, assets, iPad guards.');
