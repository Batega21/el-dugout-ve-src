---
name: configure_angular_material_theme
description:Generates or updates Angular Material Sass themes, defining light/dark modes, color palettes, typography scales, density, and custom component tokens.
metadata:
  author: Gabriel Gomez
  version: '1.0.0'
---

# Angular Material Theme Skill

## Reference Architecture & Implementation Rules

### Core Theming Principles (M3 Modern Standard)

1. **Token & CSS Variable Output:** Modern Angular Material uses design tokens emitted as CSS custom properties (`--sys-*`, `--mat-sys-*`, `--mat-*`).
2. **Native Light/Dark via `light-dark()`:** Setting `theme-type: color-scheme` allows a single CSS emission to adapt dynamically using the standard CSS `color-scheme: light dark;` property on `html` / `:root`.
3. **Core Mixin Rule:** `@include mat.core()` sets up fundamental non-theme styles (e.g., CDK overlays, ripple foundations). It should only be emitted **once** globally.
4. **Dimensions:** Every theme config accepts three primary dimensions:
* `color`: defines tones, hues, and active scheme.
* `typography`: font family, size scales, brand vs. plain text.
* `density`: compacting UI elements between `0` and `-5`.

---

## Implementation Templates for the Agent

### Pattern A: Modern Material 3 (Default standard with dynamic light/dark)

```scss
// src/styles.scss
@use '@angular/material' as mat;

@include mat.core();

// 1. Define theme configuration with M3 palettes
$custom-theme: mat.define-theme((
  color: (
    theme-type: color-scheme, // Generates CSS light-dark() functions
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: (
    plain-family: 'Roboto, sans-serif',
    brand-family: 'Roboto, sans-serif',
  ),
  density: (
    scale: 0 // Options: 0 to -5
  )
));

// 2. Emit theme tokens at root
html {
  // Allows the browser to toggle between light and dark tokens dynamically
  color-scheme: light dark;
  @include mat.all-component-themes($custom-theme);
}

// 3. Ensure base canvas background adheres to scheme
body {
  margin: 0;
  font-family: Roboto, 'Helvetica Neue', sans-serif;
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
}

```

---

### Pattern B: Dual Theme with Class Toggle (`.dark-mode` / `.light-mode`)

```scss
@use '@angular/material' as mat;

@include mat.core();

$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,
  ),
  density: (scale: 0)
));

$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$violet-palette,
  ),
  density: (scale: 0)
));

// Base light theme applied globally
:root {
  @include mat.all-component-themes($light-theme);
}

// Apply dark tokens when class is active on <body> or root container
.dark-mode {
  @include mat.all-component-colors($dark-theme);
  color-scheme: dark;
}

```

---

### Pattern C: Custom Component Integration

When authoring custom app components that need to respond to the Material theme:

```scss
// my-card.component.scss
:host {
  display: block;
  padding: 1.5rem;
  border-radius: var(--mat-sys-corner-medium, 12px);
  background-color: var(--mat-sys-surface-container);
  color: var(--mat-sys-on-surface);
  border: 1px solid var(--mat-sys-outline-variant);

  .highlight {
    color: var(--mat-sys-primary);
  }
}

```

---

## 5. Agent Validation Checklist

When your agent runs this skill, it should check:

* [ ] **No duplicate `@include mat.core()**`: Multiple inclusions bloat generated bundle size.
* [ ] **Sass Module Syntax**: Verify `@use '@angular/material' as mat;` is used instead of deprecated `@import '~@angular/material/theming'`.
* [ ] **Token Naming**: Ensure overrides target `--mat-sys-*` or `--sys-*` rather than hardcoded MDC class overrides (e.g., avoid overriding `.mdc-button__label` directly).
* [ ] **Angular.json Integration**: Verify the SCSS file containing the theme is registered in the `architect.build.options.styles` array of `angular.json`.