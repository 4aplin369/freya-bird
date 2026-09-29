import { readFile, stat } from 'node:fs/promises';
import { strict as assert } from 'node:assert';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

assert.ok(script, 'inline game script is present');
new Function(script);

for (const id of ['go', 'calm', 'fishMode', 'rustleMode', 'home', 'sound', 'fullscreen']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `control #${id} is present`);
}

for (const mode of ['hunt', 'calm', 'fish', 'rustle']) {
  assert.ok(html.includes(`play('${mode}')`), `${mode} mode is wired`);
}

for (const asset of ['feather.png', 'fish.png', 'angelfish.png', 'betta.png']) {
  const file = await stat(new URL(`../${asset}`, import.meta.url));
  assert.ok(file.size > 0, `${asset} is non-empty`);
  assert.ok(html.includes(asset), `${asset} is referenced by the page`);
}

for (const species of ['goldfish', 'angelfish', 'betta']) {
  assert.ok(html.includes(`name:'${species}'`), `${species} behavior is configured`);
  assert.ok(html.includes(`.fish.${species}`), `${species} artwork is styled`);
}

assert.ok(html.includes('fishes.length>=3'), 'fish mode is capped at three fish');
assert.ok(html.includes('className=\'rustle-bump waiting\''), 'blanket prey starts under the fabric');
assert.ok(html.includes('rustleHits%3===0'), 'mouse reveal is paced after repeated catches');
assert.ok(html.includes('fabricRipple'), 'paw catches create a fabric ripple');
assert.ok(html.includes('rustleSound'), 'blanket mode has optional rustling audio');
assert.ok(!html.includes('ДРОЖЬ ЗЕМЛИ'), 'joke title is not used in the interface');

assert.ok(html.includes('user-scalable=no'), 'iPad zoom guard is retained');
assert.ok(html.includes('touch-action:none'), 'pinch zoom is blocked at the game surface');
assert.ok(html.includes("'touchstart',blockMultiTouch"), 'multi-touch is blocked from gesture start');
assert.ok(html.includes('requestFullscreen'), 'fullscreen control is wired');
assert.ok(html.includes('apple-mobile-web-app-capable'), 'iPad Home Screen fullscreen mode is enabled');
assert.ok(html.includes('ctx.resume'), 'Web Audio is explicitly resumed after touch');
assert.ok(html.includes("if(soundOn)bubbleSound()"), 'fish sound toggle plays an audible confirmation');
assert.ok(html.includes("visibilitychange"), 'background audio lifecycle is handled');

const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
assert.equal(manifest.display, 'fullscreen', 'installed app uses fullscreen display mode');

console.log('Freya Bird smoke test passed: 4 modes, blanket prey, audio, fullscreen, iPad zoom guards.');
