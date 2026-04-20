# FCG Build Time Tracking

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| Directory creation | 18:30 | 18:30 | ~1 min |
| File creation | 18:30 | 18:35 | ~5 min |
| Backend npm install | 18:35 | 18:42 | ~7 min |
| Frontend npm install | 18:42 | 18:44 | ~2 min |
| Backend lint | 18:44 | 18:45 | ~1 min |
| Backend build | 18:45 | 18:48 | ~3 min |
| Backend tests | 18:48 | 18:52 | ~4 min |
| Frontend lint | 18:52 | 18:52 | <1 min |
| Frontend build | 18:52 | 18:53 | ~1 min |
| Frontend tests | 18:53 | 18:53 | <1 min |
| Docker compose | 18:53 | 18:58 | ~5 min |
| **Total** | 18:30 | 18:58 | **~28 min** |

## Notes
- Built by: GitHub Copilot
- Date: 2026-04-20
- Key fixes applied: shared/types copied to backend/src/shared/, Ajv named import, RenderOpts refactor, ESM jest flag, checkCoverage BgColor struct, symmetry RGBA struct

## Post-Deployment Fix: Color Harmony Rendering

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| Bug diagnosis | 22:53 | 22:54 | ~1 min |
| Palette smooth-interpolation fix | 22:54 | 22:55 | ~1 min |
| Escape-time smooth coloring fix | 22:55 | 22:56 | ~1 min |
| Rebuild + test | 22:56 | 22:57 | ~1 min |
| Docker redeploy + verify | 22:57 | 22:58 | ~1 min |

### Root Causes Fixed
1. **Hard hue steps in `buildPalette`** — `Math.floor(t * hues.length)` caused each harmony segment to be a flat solid color with an abrupt jump at the boundary (e.g. COMPLEMENTARY: 250 entries green, hard snap to 250 entries magenta). Fixed with smooth `lerpHue()` interpolation taking the shortest arc across the color wheel.
2. **Nearest-neighbour `mapColor`** — `Math.floor(value * size)` caused staircase stepping. Fixed with linear interpolation between adjacent palette entries.
3. **Integer iteration banding in escape-time fractals** — raw `iter / MAX_ITER` creates visible rings where adjacent iteration counts get the same flat color. Fixed with the standard smooth iteration count formula using `log2(|z|²)`.

## Post-Deployment Fix: Per-Renderer Coloring Strategy

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| Root-cause diagnosis (t=iter/500 maps to 1-6% of palette) | 23:00 | 23:05 | ~5 min |
| Approach A vs B comparison (cyclic vs log-mapped) | 23:05 | 23:15 | ~10 min |
| Implement log palette for escape-time renderers | 23:15 | 23:25 | ~10 min |
| Implement cyclic palette for Newton | 23:25 | 23:30 | ~5 min |
| Implement log-density for IFS/Flame/SA | 23:30 | 23:40 | ~10 min |
| Docker rebuild + verify all methods | 23:40 | 23:45 | ~5 min |
| Fix Flame: replace deterministic cycling with chaos game | 23:45 | 23:55 | ~10 min |
| Fix Strange Attractor: curated Clifford parameter table + fixed window | 23:55 | 00:10 | ~15 min |
| Final regression test (all 9 methods) | 00:10 | 00:15 | ~5 min |
| **Subtotal** | 23:00 | 00:15 | **~75 min** |

### Root Causes Fixed
1. **Flat colors (all methods)** — `t = iter / 500` maps most exterior pixels to first 1-6% of 500-entry palette. Fixed with `buildLogPalette` using `t = log(iter+1)/log(MAX+1)`.
2. **Flame ring artifacts** — `vi = i % variations.length` created deterministic periodic orbits (closed curves). Fixed with `Math.floor(rand() * xforms.length)` random selection and seed-derived expansive affine transforms using sin variations.
3. **Strange Attractor fixed-point collapse** — seed-modulo parameter generation (`seed % 100 / 50`) produced values in [-1.5, +0.5] where many Clifford parameter combinations are stable fixed points. Fixed with a curated table of 16 verified-chaotic Clifford parameter sets plus a fixed [-3.5, 3.5]² window (derived from the maximum output range of sin(a·y)+c·cos(a·x)).
