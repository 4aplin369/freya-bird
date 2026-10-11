// The house mode owns its scene and autonomous build loop; the host page owns navigation and audio settings.
function createRatHouse(world, playRustle) {
  const scene = document.createElement('div');
  scene.className = 'rat-scene';
  scene.setAttribute('aria-label', 'Крыски собирают домик');
  // Each mask reveals a distinct area of the same finished house artwork.
  // Slightly overlapping edges avoid seams between pieces on high-DPI screens.
  const buildSteps = [
    { name: 'foundation', mask: 'inset(79.8% 0 0 0)', material: 'twig' },
    { name: 'left-wall-lower', mask: 'polygon(0 67%,10% 64%,19% 67%,30% 64%,40.2% 66%,40.2% 80.2%,0 80.2%)', material: 'twig' },
    { name: 'left-wall-upper', mask: 'polygon(0 55%,10% 52%,19% 56%,30% 52%,40.2% 54%,40.2% 69%,0 69%)', material: 'twig' },
    { name: 'right-wall-lower', mask: 'polygon(59.8% 66%,70% 64%,81% 67%,90% 64%,100% 67%,100% 80.2%,59.8% 80.2%)', material: 'twig' },
    { name: 'right-wall-upper', mask: 'polygon(59.8% 54%,70% 52%,81% 56%,90% 52%,100% 55%,100% 69%,59.8% 69%)', material: 'twig' },
    { name: 'entrance-lower', mask: 'polygon(39.8% 66%,46% 64%,54% 67%,60.2% 65%,60.2% 80.2%,39.8% 80.2%)', material: 'twig' },
    { name: 'entrance-upper', mask: 'polygon(39.8% 54%,46% 52%,54% 56%,60.2% 54%,60.2% 69%,39.8% 69%)', material: 'twig' },
    { name: 'left-eave', mask: 'inset(37.8% 49.8% 44.8% 0)', material: 'leaf' },
    { name: 'right-eave', mask: 'inset(37.8% 0 44.8% 49.8%)', material: 'leaf' },
    { name: 'left-roof', mask: 'inset(23.8% 49.8% 61.8% 0)', material: 'leaf' },
    { name: 'right-roof', mask: 'inset(23.8% 0 61.8% 49.8%)', material: 'leaf' },
    { name: 'left-ridge', mask: 'inset(0 49.8% 75.8% 0)', material: 'leaf' },
    { name: 'right-ridge', mask: 'inset(0 0 75.8% 49.8%)', material: 'leaf' }
  ];
  scene.innerHTML = `<div class="rat-clearing" aria-hidden="true"></div><div class="rat-house">${buildSteps.map(step => `<div class="rat-part" data-step="${step.name}" style="clip-path:${step.mask}"></div>`).join('')}</div>`;
  world.append(scene);
  const house = scene.querySelector('.rat-house');
  const parts = [...house.querySelectorAll('.rat-part')];
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let built = 0, completedAt = 0, last = 0;
  const rats = [1, -1].map((side, index) => {
    const el = document.createElement('div');
    el.className = 'builder-rat';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Крыска бежит с материалами');
    el.innerHTML = '<img class="rat-idle" src="rat-light.png" alt=""><i class="rat-run" aria-hidden="true"></i><i class="cargo"></i>';
    scene.append(el);
    const rat = { el, side, x: 0, y: 0, state: 'inbound', waitUntil: 0, boostUntil: 0, carrying: true, bob: index * 2.1 };
    el.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (rat.state === 'caught') return;
      rat.state = 'caught';
      rat.waitUntil = performance.now() + 1600;
      rat.boostUntil = 0;
      rat.carrying = false;
      el.classList.remove('resting', 'sprinting');
      const box = el.getBoundingClientRect();
      const ring = document.createElement('i');
      ring.className = 'rat-paw-ring';
      ring.style.left = `${box.left - scene.getBoundingClientRect().left + box.width * .6}px`;
      ring.style.top = `${box.top - scene.getBoundingClientRect().top + box.height * .6}px`;
      scene.append(ring);
      el.hidden = true;
      setTimeout(() => ring.remove(), 600);
      playRustle(.05);
    });
    return rat;
  });
  function positions(rat) {
    const w = scene.clientWidth, h = scene.clientHeight, ratW = rat.el.offsetWidth, ratH = ratW / 1.5;
    const center = (w - ratW) / 2 - rat.side * Math.min(100, w * .1);
    const stash = rat.side === 1 ? Math.max(8, w * .09 - ratW * .25) : Math.min(w - ratW - 8, w * .91 - ratW * .75);
    const floor = h * .82 - ratH * .88;
    return { center, stash, floor };
  }
  rats.forEach((rat, index) => {
    const p = positions(rat);
    rat.x = index === 0 ? p.stash : Math.min(scene.clientWidth, p.stash + 80);
    rat.y = p.floor;
    rat.waitUntil = performance.now() + index * 1250;
  });
  function setCargo(rat) {
    const cargo = rat.el.querySelector('.cargo');
    cargo.hidden = !rat.carrying;
    cargo.classList.toggle('leaf', buildSteps[Math.min(built, buildSteps.length - 1)].material === 'leaf');
  }
  function deliver(now) {
    if (built >= parts.length) return;
    parts[built].classList.add('built');
    built++;
    scene.classList.add('has-house');
    playRustle(.018);
    if (built === parts.length) {
      completedAt = now;
      house.classList.add('complete');
      rats.forEach(rat => {
        if (rat.state !== 'caught') rat.state = 'outbound';
        rat.carrying = false;
      });
    }
  }
  function reset() {
    built = 0;
    completedAt = 0;
    scene.classList.remove('has-house');
    house.classList.remove('complete');
    parts.forEach(part => part.classList.remove('built'));
    rats.forEach((rat, index) => {
      if (rat.state === 'caught') return;
      rat.state = 'inbound';
      rat.carrying = true;
      rat.waitUntil = performance.now() + index * 1100;
    });
  }
  function frame(now) {
    if (!last) last = now;
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    if (completedAt && now - completedAt > 6200) reset();
    for (const rat of rats) {
      if (rat.state === 'caught') {
        if (now < rat.waitUntil) continue;
        // Reveal before measuring: hidden elements have zero width.
        rat.el.hidden = false;
      }
      const p = positions(rat);
      if (rat.state === 'caught') {
        // Re-enter from the edge, away from the paw that caught this rat.
        rat.x = rat.side === 1 ? -rat.el.offsetWidth : scene.clientWidth;
        rat.y = p.floor;
        rat.state = completedAt ? 'outbound' : 'inbound';
        rat.carrying = !completedAt;
        rat.waitUntil = 0;
      }
      const target = rat.state === 'inbound' ? p.center : p.stash;
      const waiting = now < rat.waitUntil || rat.state === 'rest';
      const speed = reducedMotion?.matches ? 95 : now < rat.boostUntil ? 440 : 175;
      if (!waiting) {
        const delta = target - rat.x;
        const approach = Math.max(.42, Math.min(1, Math.abs(delta) / 65));
        rat.x += Math.sign(delta) * Math.min(Math.abs(delta), speed * approach * dt);
        if (Math.abs(target - rat.x) < 1) {
          if (rat.state === 'inbound') {
            deliver(now);
            rat.carrying = false;
            rat.state = 'outbound';
            rat.waitUntil = now + 650 + Math.random() * 420;
          } else if (completedAt) {
            rat.carrying = false;
            rat.state = 'rest';
          } else {
            rat.carrying = true;
            rat.state = 'inbound';
            rat.waitUntil = now + 450 + Math.random() * 600;
          }
        }
      }
      const moving = !waiting && Math.abs(target - rat.x) >= 1;
      rat.el.classList.toggle('resting', !moving);
      rat.el.classList.toggle('sprinting', moving && now < rat.boostUntil);
      setCargo(rat);
      rat.y += (p.floor - rat.y) * Math.min(1, dt * 4);
      const direction = rat.state === 'inbound' || rat.state === 'rest' ? rat.side : -rat.side;
      const bob = moving && !reducedMotion?.matches ? Math.sin(now / 80 + rat.bob) * 3 : 0;
      rat.el.style.transform = `translate(${rat.x}px,${rat.y + bob}px) scaleX(${direction})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { scene, rats, house, get built() { return built; } };
}
