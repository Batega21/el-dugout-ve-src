# TASK: Implement Full Internationalization (i18n) & Dynamic Language Switcher in Angular

## Objective

Implement runtime dynamic internationalization (i18n) across the entire VeneBéisbol Angular application supporting Spanish (`es`) and English (`en`). Provide a language toggle component with the flags of Venezuela (for Spanish) and the USA (for English) positioned immediately to the right of the existing `theme-toggle` button. Audit and standardize all mixed hardcoded strings across the project into localized translation keys.

---

## 1. Technical Strategy & Library Selection

- Implement `@ngx-translate/core` and `@ngx-translate/http-loader` (or modern equivalent compatible with Angular standalone bootstrap and `provideHttpClient`).
- Store locale files in standard location: `src/assets/i18n/es.json` and `src/assets/i18n/en.json`.
- Default language: `es` (Spanish). Fallback language: `es`.
- Persistence: Persist selected language in `localStorage` under key `venebeisbol_lang` so user preference is remembered across sessions.

---

## 2. Configuration & Application Bootstrap

1. **Providers & Bootstrap:**
   - Update `src/app/app.config.ts` (or `main.ts` if using standalone bootstrap) using `provideHttpClient(withInterceptorsFromDi())`.
   - Configure `TranslateModule.forRoot({...})` with `TranslateHttpLoader` loading `./assets/i18n/{lang}.json`.
2. **Translation Service Initialization:**
   - In `AppComponent` (or an initialization service/effect), set available languages (`['es', 'en']`), set default to `'es'`, and read from `localStorage.getItem('venebeisbol_lang') || 'es'`.

---

## 3. UI Component: Language Switcher with Flags

- **Placement:** Position directly to the right of the `theme-toggle` button in the main header / navigation bar.
- **Visual Specifications:**
  - Display flag icons for **Venezuela 🇻🇪** (`es`) and **USA 🇺🇸** (`en`).
  - Use high-quality SVG icons or vector-styled SVG inline elements for both flags to match the application's dark/light sports-tech design tokens.
  - Active state: Highlight the active language flag with a primary red border or glowing badge indicator (`border-red-500` or subtle background accent).
  - Hover/Focus state: Interactive scale/opacity transition with accessible `aria-label` tags (`"Cambiar a Español"` / `"Switch to English"`).
  - Reactivity: Use Angular Signals (`selectedLang = signal<'es' | 'en'>('es')`) to manage the current state and trigger `translateService.use(lang)` on click.

---

## 4. Translation Files & Domain Terminology (`src/assets/i18n/`)

Create comprehensive `es.json` and `en.json` dictionaries covering:

1. **Common / Navigation:**
   - Home, Stats, Leaderboards, Players, Teams, Admin, Search, Dark/Light mode, etc.
2. **Baseball Terminology & Metrics:**
   - `AVG`: Promedio / Batting Average
   - `H`: Hits / Hits
   - `2B`: Dobles / Doubles
   - `3B`: Triples / Triples
   - `HR`: Jonrones / Home Runs
   - `R` / `CA`: Carreras Anotadas / Runs Scored
   - `RBI` / `CI`: Carreras Impulsadas / Runs Batted In
   - `JJ` / `G`: Juegos Jugados / Games Played
   - `VB` / `AB`: Veces al Bate / At Bats
   - Positions, eras, and historical milestones.
3. **Player Profile & Stats Tables:**
   - Career summary, Bio, Bats/Throws (Batea/Lanza: Derecho/Zurdo/Ambidiestro - Right/Left/Switch), Hall of fame badges.
4. **Admin Panel & Data Ingestion:**
   - Upload instructions, drag-and-drop labels, file formats supported (`.csv`, `.xlsx`), upload button, validation status messages, error and success alerts.

---

## 5. Refactor Existing Templates (Audit Mixed Text)

- Scan all existing `.html` templates and component files. Currently, some UI sections contain English text and others contain Spanish text.
- Replace all hardcoded UI strings with the `translate` pipe or `TranslateService.instant()` / `TranslateService.stream()`:
  - Example: `{{ 'STATS.BATTING_AVG' | translate }}`
  - Ensure table headers, tooltips, buttons, form placeholders, and aria-labels are fully localized.

---

## Acceptance Criteria

- [ ] Language toggle with Venezuela and USA flag icons renders neatly aligned to the right of the theme toggle.
- [ ] Clicking a flag seamlessly switches all application text between Spanish and English in real-time without reloading the page.
- [ ] The chosen language persists in `localStorage` on page refresh.
- [ ] No hardcoded Spanish or English strings remain in header, footer, leaderboard tables, player cards, or admin panel.
- [ ] Project builds cleanly (`ng build`) with zero TypeScript errors or missing translation warnings.