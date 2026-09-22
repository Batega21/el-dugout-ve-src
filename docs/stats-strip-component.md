# Walkthrough: Stats Strip Component (`StatsStripComponent`)

A new, reusable standalone component has been created and integrated below the Hero section on the homepage: [`StatsStripComponent`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/stats-strip/stats-strip.component.ts).

The component displays the top records of each LVBP category inside an infinite marquee ticker strip styled with the Venezuelan baseball crimson red theme (`--rojo`).

---

## ⚾ Features & Architecture

1. **Standalone Component (`StatsStripComponent`)**:
   - Location: [`frontend/src/app/shared/components/stats-strip/`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/stats-strip/)
   - Selector: `app-stats-strip`
   - Signal-based input `items`: Accepts an array of [`StatRecordItem`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/stats-strip/stats-strip.interface.ts#L4) (`label`, `value`).
   - Signal-based input `fullWidth`: Defaults to `true` to span the full viewport width (`100vw`).
   - Signal computed `duplicatedItems`: Automatically clones the record set once to ensure a 100% seamless, continuous `-50%` marquee loop with zero jitter.

2. **Default LVBP Top Records**:
   - **Récord AVG**: `.430 — Alí Castillo 2020-21`
   - **Récord Innings**: `208.0 — Emilio Cueche 1953-54`
   - **Récord Triples**: `10 — Félix Rodríguez 1976-77`
   - **Más títulos bateo**: `6x — Luis Sojo`
   - **Temporadas registradas**: `80 Temporadas LVBP`

3. **Styling & Animation**:
   - Exact implementation of the provided CSS (`.stats-strip`, `.strip-inner`, `@keyframes marquee`, `.strip-item`, `.si-label`, `.si-val`, `.strip-sep`).
   - Font family `'Bebas Neue', sans-serif` for high-impact metric values.
   - Theme token `--rojo` defined in both dark and light modes with fallback `#b91c1c`.
   - Accessible hover state: Pauses animation on hover for readability.
   - Accessible motion: Respects `@media (prefers-reduced-motion: reduce)`.

4. **Integration**:
   - Added directly below `<app-hero>` and before `<app-section>` in [`HomeComponent`](file:///Users/gabo/repos/el-dugout/frontend/src/app/features/home/home.component.ts).

---

## 🧪 Verification & Testing

### Automated Unit Tests
- Suite: [`stats-strip.component.spec.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/stats-strip/stats-strip.component.spec.ts)
- Vitest results:
  - 13 test files passed (96/96 tests passing across the app).
  - Verified default item population, 10 duplicated items for loop, label matching, custom input overrides, and empty array handling.

### TypeScript Compilation
- `npx tsc -p tsconfig.app.json --noEmit`: 0 errors.
- `npx tsc -p tsconfig.spec.json --noEmit`: 0 errors.
