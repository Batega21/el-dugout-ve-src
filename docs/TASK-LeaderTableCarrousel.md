# TASK: Create an Angular "LeaderTableCarouselComponent" with Edge Gradients & SVG Controls

## Objective

Implement a reusable, highly optimized carousel component in Angular (`LeaderTableCarouselComponent`) that displays historical top-5 baseball leader tables. The component must support progressive lazy loading, side-peeking tables with gradient masks, smooth transitions, and custom baseball-themed SVG navigation buttons based on the provided wireframes and UI references.
Relocate the "System Health Matrix" section-cards to the "admin workspace".
Remove the "Quick Setup Guide" from the home component.

---

## 1. Visual Layout & Behavior Specifications (Refer to Attached Layout)

1. **Center Stage with Peeking Adjacent Cards:**
   - The active leader table is centered in the viewport container.
   - The previous ("Last") and next ("Second") leader tables must peek in slightly from the left and right edges.
   - **Gradient Masks / Overlays:**
     - Left edge overlay:
        - Dark Theme: A linear gradient (`from-black/100 to-transparent` in dark mode, or matching theme background) fading from left (100% opacity) to right (0% opacity) covering the peeking previous table.
        - Light Theme: A linear gradient (`from-white/100 to-transparent` in light mode, or matching theme background) fading from left (100% opacity) to right (0% opacity) covering the peeking previous table.
     - Right edge overlay:
        - Dark Theme: A linear gradient fading from right (100% opacity) to left (0% opacity) covering the peeking next table.
        - Light Theme: A linear gradient fading from right (100% opacity) to left (0% opacity) covering the peeking next table.
   - The active centered card has full opacity and crisp visibility.

2. **Navigation Buttons (`home_plate_btn.svg`):**
   - Source path: `public/images/svg/home_plate_btn.svg` (or `/assets/images/svg/home_plate_btn.svg`).
   - Positioned vertically centered on the left and right sides of the carousel container (anchored over the gradient areas).
   - The left button points left; the right button points right (rotate 180° if needed).
   - **Theme Handling**: 
     - Dark theme: Update the SVG fill colors to match the dark theme defined in the _theme.scss file.
     - Light theme: Update the SVG fill colors to match the light theme defined in the _theme.scss file.
   - **Interactions & Animations:**
     - `hover`: Slight scale-up (`scale-110`), glowing red drop-shadow filter (`drop-shadow-[0_0_10px_rgba(229,35,35,0.6)]`), smooth cubic-bezier transition.
     - `active / click`: Quick press feedback (`scale-95`), trigger sliding animation to previous or next table.
     - `disabled`: Reduced opacity (`opacity-30 cursor-not-allowed`) if reaching carousel boundaries (or implement circular/infinite looping).

---

## 2. Component Instances & Datasets (Top-5 Records per Table)

Create two instances or configurations for the view:

### Instance 1: "All-Time Career Batting Records"

Tables included in the carousel (each showing Top 5 players):
1. **Home Runs Leaders (`HR`)**
2. **Hits Leaders (`H`)**
3. **Batting Average Leaders (`AVG`)**
4. **Stolen Bases Leaders (`BR` / `SB`)**

### Instance 2: "All-Time Career Pitching Records"

Tables included in the carousel (each showing Top 5 pitchers):
1. **Wins (`JG` / `W`)**
2. **Strikeouts (`SO` / `K`)**
3. **Saves (`JS` / `SV`)**

### Table Card Architecture (Top-5 Limit):

- Header: Category Title with an icon (e.g., "⚾ CAMPEONES DE BATEO" or "LÍDERES EN HITS").
- Column headers: `AÑO/TEMP` | `JUGADOR` | `EQUIPO` | `[STAT]` (e.g., `HR`, `AVG`, `SO`).
- Rows: Strictly sliced to the first 5 records (`items.slice(0, 5)`).
- Typography: Names in high-contrast sans-serif, stats formatted with monospace numbers highlighted in primary red (`#e52323` or `#ef4444`).
- Footer link: "VER HISTORIA COMPLETA →" (View Full History link pointing to the full stats view).

---

## 3. Technical Requirements (Modern Angular)

1. **Architecture:**
   - Standalone Angular Component (`LeaderTableCarouselComponent`) utilizing Angular Signals for active index and state management:
     - `currentIndex = signal<number>(0)`
     - `isLoading = signal<boolean>(false)`
     - `activeCategory = computed(...)`
   - Use modern control flow (`@for`, `@if`, `@switch`).
2. **Progressive / Lazy Loading:**
   - Implement deferred or progressive loading for off-screen tables (e.g., using `@defer (on viewport)` or rendering heavy tables only when they become active or adjacent).
   - Smooth CSS transform transitions (`transform: translateX(...)`) with hardware acceleration (`will-change: transform`).
3. **Touch & Keyboard Accessibility:**
   - Support swipe gestures on mobile/touch devices.
   - Support keyboard navigation (Arrow Left / Arrow Right) with proper `aria-label` tags on the navigation buttons.
4. **Theming & i18n:**
   - Full dark mode (primary `#0a0a0c`, cards `#121216`) and light mode compatibility.
   - All headers, button aria-labels, and metric labels wired to the translation service (`translate` pipe).

---

## Acceptance Criteria
- [ ] Center table is prominently displayed while adjacent tables peek through the left and right gradient masks.
- [ ] Left and right SVG buttons load cleanly from `public/images/svg/home_plate_btn.svg` with working hover/click animations.
- [ ] Batting carousel switches smoothly between Home Runs, Hits, Batting Average, and Stolen Bases.
- [ ] Pitching carousel switches smoothly between Wins, Strikeouts, and Saves.
- [ ] Each table renders strictly the top 5 records with monospaced red stats and a bottom "View Full History" link.
- [ ] "System Health Matrix" is moved to admin workspace.
- [ ] "Quick Setup Guide" is removed from home.
- [ ] Ensure that the Theming and i18n is working as expected.