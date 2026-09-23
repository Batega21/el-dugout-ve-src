# TASK: Create an Angular "HistoricalRecordsComponent" with Lazy On-Viewport Fetching

## Objective

Convert an existing HTML markup blueprint into a high-performance, standalone Angular component (`HistoricalRecordsComponent`). The component must display key historical baseball records in a modern sports-tech responsive grid. Data must be fetched from the PostgreSQL database via NestJS API **only when the user scrolls and reaches this section** on the page.
This component wil be the first section for the home page.

---

## 1. Component Markup & Design System Alignment

Refactor the provided HTML snippet into modern Angular template syntax:

```html
<section id="records" class="records-section" #recordsViewport>
  <div class="container mx-auto px-4 py-12">
    <!-- Section Label / Tagline -->
    <div class="flex items-center gap-3 mb-2">
      <div class="records-tag-bar"></div>
      <span class="records-tag">
        {{ 'RECORDS.TAG' | translate }}
      </span>
    </div>

    <!-- Section Title & Subtitle -->
    <h2 class="records-title">
      {{ 'RECORDS.TITLE' | translate }}
    </h2>
    <p class="records-subtitle">
      {{ 'RECORDS.SUBTITLE' | translate }}
    </p>

    <!-- Records Grid Container -->
    @if (isLoading()) {
      <div class="records-grid">
        @for (item of [1, 2, 3, 4, 5, 6, 7, 8]; track item) {
          <div class="animate-pulse bg-[#121216] border border-[#1f2937] rounded-lg p-6 h-44"></div>
        }
      </div>
    } @else if (records().length > 0) {
      <div class="records-grid">
        @for (record of records(); track record.id) {
          <div class="rec-card group relative">
            <!-- Numeric Record Value -->
            <span class="record-value">
              {{ record.value }}
            </span>
            <!-- Metric Name / Label -->
            <div class="record-label">
              {{ record.label }}
            </div>
            <!-- Record Holder Name -->
            <div class="record-holder">
              {{ record.holder }}
            </div>
            <!-- Year / Season -->
            <div class="record-year">
              {{ record.year }}
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="records-empty">
        {{ 'RECORDS.EMPTY' | translate }}
      </div>
    }
  </div>
</section>

```

---

## 2. On-Viewport / Scroll Trigger Strategy

Ensure historical data is updated automatically as soon as the user reaches this section:

1. **Option A: Angular Native `@defer (on viewport)` (Preferred):**
* Wrap the data-fetching and child cards inside `@defer (on viewport) { ... } @placeholder { ... }`.
* In the component's `ngOnInit` (or when the deferred block resolves), trigger the service method to query the API for the latest historical milestones.


2. **Option B: IntersectionObserver fallback:**
* Attach an `IntersectionObserver` to `#recordsViewport`.
* When `isIntersecting === true`, invoke `this.loadRecords()` once and disconnect the observer to prevent redundant network calls.



---

## 3. Data Interface & Backend Service Contract

### TypeScript Interface (`src/app/core/models/record.model.ts`):

```typescript
export interface HistoricalRecordDto {
  id: string;
  category: 'batting' | 'pitching' | 'general';
  label: string;       // e.g., "Más Jonrones en una Temporada", "Más Ponches"
  value: string;       // e.g., "21", ".416", "234"
  holder: string;      // e.g., "Alex Cabrera", "Ugueth Urbina"
  year: string;        // e.g., "2013-14"
  team?: string;       // e.g., "Tiburones de La Guaira"
  updatedAt?: string;
}

```

### NestJS Backend API Route:

* Create or connect endpoint: `GET /api/v1/records/historical-milestones`
* Ensure SQL query extracts the validated top record holders aggregated from PostgreSQL.

---

## 4. Theming and i18n

* Support light and dark mode styles seamlessly (`dark:bg-[#121216]`, `light:bg-white`, light border `#e2e8f0`).
* Add required dictionary keys to both `es.json` and `en.json`:
* `RECORDS.TAG`: `"Hitos y Marcas"` / `"Milestones & Marks"`
* `RECORDS.TITLE`: `"Récords Históricos de la LVBP"` / `"LVBP All-Time Records"`
* `RECORDS.SUBTITLE`: `"Las mayores marcas individuales registradas en más de 80 años de pelota profesional."` / `"The greatest individual achievements recorded across 80+ years of professional baseball."`



---

## Acceptance Criteria

* [ ] Component triggers API fetch only when scrolled into the browser viewport.
* [ ] Skeleton loaders display smoothly while database results are queried.
* [ ] Grid is fully responsive across mobile (1 column), tablet (2 columns), and desktop (4 columns).
* [ ] Hover animations and red accent glowing effects work according to design tokens.
* [ ] All text content is bound to `TranslatePipe` without hardcoded copy.
