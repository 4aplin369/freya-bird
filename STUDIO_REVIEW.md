# Freya Bird — Game Dev Studio review

## Product goal

A small iPad experience for Freya with two distinct jobs:

- active visual hunting through birds, a ground mouse, and fish;
- a predictable low-stimulation feather scene that Freya already uses before sleep.

The cat's observed behaviour is the acceptance signal. The project should not turn the calming mode into another reward loop.

## Current strengths

- Three modes have clearly different purposes.
- Targets are large enough for paw input and Safari zoom gestures are suppressed.
- Sound is optional and mode-specific.
- Birds, fish, mouse, feathers, bubbles, and hiding layers produce readable silhouettes and feedback.
- The calming mode has direct positive observation from the owner, so its rhythm is treated as locked.

## Production slice applied on `codex/game-dev-studio`

- Resize and preload the two visual assets: combined weight drops from about 4 MB to about 0.7 MB while retaining more source resolution than their rendered size requires.
- Preserve the fish's facing direction while it pauses.
- Stop the synthetic purr when Safari goes into the background and resume it only when appropriate.
- Add a zero-dependency smoke test for script parsing, controls, assets, modes, and iPad safeguards.
- Keep all game behaviour and visual tuning unchanged.

## Architecture decision

The game remains dependency-free and deployable as static GitHub Pages. The current single HTML file is acceptable for this small product, but it is at the maintainability limit. The next structural change should split UI styles, audio, mode controllers, and tuning data only when another feature is approved; it should not be mixed into this stabilization slice.

## Ruthless playtest

### Must fix

- Real iPad testing is still required after every visual or audio change; a parser test cannot prove motion quality or sound comfort.
- The app has no built-in session boundary for active hunting. This is intentionally deferred because the owner has not approved auto-ending play.

### Should improve

- Add a small owner-only settings panel for target count, speed, and sound volume.
- Record a manual checklist for Safari rotation, Home Screen launch, background/resume, and multi-touch.

### Do not add now

- Scores, streaks, flashing rewards, forced progression, or extra activity in the feather mode.
- More prey types before observing whether Freya consistently prefers birds, mouse, or fish.

## Acceptance criteria

- `npm test` passes.
- Runtime screenshots confirm the menu, calming scene, and fish scene render with their intended assets and contrast.
- All referenced assets exist and are non-empty.
- Birds, calm feathers, and fish remain selectable from the first screen.
- Fish do not flip direction when merely pausing.
- Purring does not continue while the page is hidden.
- No changes are published to `main` until the owner reviews this branch.

## QA evidence

- Automated smoke test: **Passed** with `npm test`.
- Main menu visual QA: **Passed**, `qa/main-menu.png`.
- Calming scene visual QA: **Passed**, `qa/calm-mode.png`.
- Fish scene visual QA: **Passed**, `qa/fish-mode.png`.
- Bird behaviour regression playtest: **Not run**; its implementation was intentionally left unchanged.
- Physical iPad/Safari and cat-response check: **Not run**; requires the owner's device and Freya.
