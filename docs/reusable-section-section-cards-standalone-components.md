# Walkthrough - Reusable Section & Section-Cards Standalone Components

Refactored **`SectionComponent`** and **`SectionCardsComponent`** into reusable standalone components driven by strongly-typed TypeScript interfaces, Angular `input()` signals, and modern control flow (`@for` and `@if`), matching the pattern established for `FooterComponent`.

---

## 1. Reusable `SectionComponent` (`<app-section [config]="mySectionData">`)

### Strongly-Typed Interface
Created [`section.interface.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/section/section.interface.ts):
```typescript
export interface SectionMediaConfig {
  image?: string;
  text?: string;
  alt?: string;
}

export interface SectionConfig {
  align?: 'left' | 'right';
  background?: string | null;
  parallax?: boolean;
  title?: string;
  description?: string;
  media?: SectionMediaConfig;
  mediaImage?: string;
  mediaText?: string;
}
```

### Component Architecture
Updated [`section.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/section/section.component.ts):
- **Signals-Driven Configuration**: Accepts a single `readonly config = input<SectionConfig>(DEFAULT_SECTION_CONFIG);` signal with sensible defaults.
- **Computed Value Resolution**: Resolves alignment (`resolvedAlign`), custom background (`resolvedBackground`), parallax attachment (`resolvedParallax`), title, description, and media attributes reactively.
- **Backward Compatibility**: Maintains support for legacy direct/aliased inputs (`section-align`, `section-title`, etc.) through computed fallbacks.
- **Responsive 60/40 Split**: Preserves responsive desktop 60/40 grid and mobile single-column stacking with CSS custom properties and theme tokens.

---

## 2. Reusable `SectionCardsComponent` (`<app-section-cards [config]="mySectionCardsData">`)

### Strongly-Typed Interface
Created [`section-cards.interface.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/section-cards/section-cards.interface.ts):
```typescript
export type BadgeType = 'success' | 'warning' | 'danger' | 'neutral';

export interface SectionCardBadge {
  text: string;
  type?: BadgeType;
}

export interface SectionCardButton {
  label: string;
  action?: string;
  disabled?: boolean;
}

export interface SectionCardItem {
  id?: string;
  title: string;
  description?: string;
  badge?: SectionCardBadge;
  footerCode?: string;
  footerButton?: SectionCardButton;
  footerText?: string;
}

export interface SectionCardsConfig {
  adminOnly?: boolean;
  indicatorText?: string;
  cards: SectionCardItem[];
}
```

### Component Architecture
Updated [`section-cards.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/section-cards/section-cards.component.ts):
- **Modern Control Flow**: Replaced static markup with `@for (card of effectiveConfig().cards; track card.id || card.title)` and `@if` blocks.
- **Interactive Action Output**: Emits `readonly cardAction = output<{ card: SectionCardItem; action: string }>()` when custom buttons are clicked.
- **Dynamic Telemetry Integration**: Built-in dynamic resolution for system health probe monitoring when cards specify `id: 'backend'` or `action: 'refresh-health'`.
- **RBAC Visibility Control**: Supports public display when `adminOnly: false` or restricted admin viewing when `adminOnly: true`.

---

## 3. Implementation in `HomeComponent`

Updated [`home.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/features/home/home.component.ts) to demonstrate the reusable usage:

```html
<!-- Section 1 (Align Left) -->
<app-section [config]="section1Config"></app-section>

<!-- Section 2 (Align Right) -->
<app-section [config]="section2Config"></app-section>

<!-- System Health Matrix -->
<app-section-cards [config]="systemHealthCardsConfig"></app-section-cards>
```

---

## 4. Verification & Quality Gates

### A. Frontend Unit Tests (Vitest)
```bash
npm --prefix frontend run test:unit
```
- **Result**: **10 test files passed, 80 tests passed** (100% pass rate).
  - `section.component.spec.ts` (5 tests passed): Verifies default config values, custom `SectionConfig` overrides, parallax styling, and color backgrounds.
  - `section-cards.component.spec.ts` (9 tests passed): Verifies `SectionCardsConfig` data rendering, `@for` looping, status badges, health check actions, and `cardAction` event emission.

### B. Backend Unit Tests (Jest)
```bash
npm run test:backend
```
- **Result**: **5 test suites passed, 42 tests passed** (100% pass rate).

### C. Full Production Build
```bash
npm run build:all
```
- **Backend (`nest build`)**: **SUCCESS** (`exit 0`).
- **Frontend (`ng build --configuration production`)**: **SUCCESS** (`exit 0`).
  - No size budget warnings for `SectionComponent` or `SectionCardsComponent`.
