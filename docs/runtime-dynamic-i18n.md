# Walkthrough: Runtime Dynamic Internationalization (i18n)

We have implemented complete, runtime dynamic internationalization (i18n) across the entire Andina Angular application, supporting **Spanish (`es`)** (default) and **English (`en`)**.

---

## 🚀 Key Highlights & Architecture

1. **Signal-Driven Reactive Engine (Zero 3rd-Party Overhead)**:
   - Built natively with Angular 22 Signals (`signal()`, `computed()`) and an impure standalone `TranslatePipe`.
   - Switching languages updates every template, reactive property, and DOM node instantaneously without page reloads or loss of application state.
2. **Persistent Preferences & SEO / A11y**:
   - Persists selected language to `localStorage` under key `andina_language`.
   - Dynamically updates `<html lang="es">` or `<html lang="en">` on the document root.
3. **Interactive Language Switcher**:
   - Replaced static `ES / EN` placeholder with an accessible, keyboard-friendly pill toggle (`LanguageSwitcherComponent`).
   - Integrated in both the desktop header navigation bar and the mobile drawer menu.
4. **Complete Application Coverage**:
   - **Header & Navigation**: Base section links, role-based links ("Manage Users" / "Gestionar Usuarios"), CTA buttons ("Login" / "Sign up"), user account menu ("Profile", "Subscribe", "System Matrix", "Logout").
   - **Home Page**: Hero component (tagline, title, description, CTA) and all 8 editorial/cards sections (Sections 01–08).
   - **Footer**: Brand slogan, about block, section links, contact labels, newsletter placeholder, and copyright notice.
   - **Auth Dialogs**: Full localization for Login and Sign-up dialogs, including field labels, placeholders, and validation error messages.
   - **Subscription Dialog**: Free and Premium plans, monthly/annual billing options, discounts, and legal disclosures.
   - **Admin Workspace (`/admin`)**: Telemetry metrics, status indicators, and subscriber table.
   - **User Management (`/users`)**: Table columns, empty states, and user creation form.
   - **Profile (`/profile`)**: Avatar upload labels, personal info, 2FA toggle, change password fields, and validation states.
   - **Premium (`/premium`) & Architecture (`/architecture`)**: Cloud deployment topology captions and architectural pillar descriptions.

---

## 📁 Changes Summary

### 1. Core i18n Engine
- [`i18n.model.ts`](file:///Users/gabo/repos/andina/frontend/src/app/core/i18n/i18n.model.ts): Supported languages (`'es' | 'en'`), defaults, and parameter types.
- [`translations/es.ts`](file:///Users/gabo/repos/andina/frontend/src/app/core/i18n/translations/es.ts): Comprehensive Spanish dictionary.
- [`translations/en.ts`](file:///Users/gabo/repos/andina/frontend/src/app/core/i18n/translations/en.ts): Comprehensive English dictionary.
- [`i18n.service.ts`](file:///Users/gabo/repos/andina/frontend/src/app/core/i18n/i18n.service.ts): Signal-driven service with `currentLang`, `setLanguage`, `toggleLanguage`, `translate`, and `interpolate`.
- [`translate.pipe.ts`](file:///Users/gabo/repos/andina/frontend/src/app/core/i18n/translate.pipe.ts): Standalone impure pipe for zero-lag template expressions.

### 2. UI Components & Switcher
- [`language-switcher.component.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/language-switcher/language-switcher.component.ts), [`.html`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/language-switcher/language-switcher.component.html), [`.scss`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/language-switcher/language-switcher.component.scss): Interactive segmented toggle.
- [`nav-menu.component.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/header/nav-menu/nav-menu.component.ts) & [`.html`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/header/nav-menu/nav-menu.component.html): Localized navigation links, buttons, and integrated switcher.
- [`avatar.component.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/header/avatar/avatar.component.ts) & [`.html`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/header/avatar/avatar.component.html): Localized tier badge, aria labels, and menu items.

### 3. Home & Sections
- [`home-sections.constant.ts`](file:///Users/gabo/repos/andina/frontend/src/app/features/home/home-sections.constant.ts): Localized `getHomeSectionsConfig(lang)` returning Spanish or English section configurations.
- [`home.component.ts`](file:///Users/gabo/repos/andina/frontend/src/app/features/home/home.component.ts) & [`.html`](file:///Users/gabo/repos/andina/frontend/src/app/features/home/home.component.html): Computed section configurations and localized hero inputs.

### 4. Footer & Layout
- [`footer.interface.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/footer/footer.interface.ts): `getLocalizedFooterConfig(lang)` helper.
- [`app.component.ts`](file:///Users/gabo/repos/andina/frontend/src/app/app.component.ts): Dynamic `footerData` getter resolving according to active language signal.

### 5. Dialogs & Feature Pages
- [`login-dialog.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/login-dialog/login-dialog.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/login-dialog/login-dialog.component.ts): Full modal translation.
- [`sign-up-dialog.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/sign-up-dialog/sign-up-dialog.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/sign-up-dialog/sign-up-dialog.component.ts): Full modal translation.
- [`subscription-dialog.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/subscription-dialog/subscription-dialog.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/subscription-dialog/subscription-dialog.component.ts): Full modal translation.
- [`admin-dashboard.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/features/admin/admin-dashboard.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/features/admin/admin-dashboard.component.ts): Health matrix and subscriber table translated.
- [`users.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/features/users/users.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/features/users/users.component.ts): User management and creation form translated.
- [`profile.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/features/profile/profile.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/features/profile/profile.component.ts): Account profile and security settings translated.
- [`premium-feature.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/features/premium/premium-feature.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/features/premium/premium-feature.component.ts): Gated feature page translated.
- [`architecture.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/features/architecture/architecture.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/features/architecture/architecture.component.ts): Cloud diagrams and architecture pillars translated.
- [`navbar.component.html`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/navbar/navbar.component.html) & [`.ts`](file:///Users/gabo/repos/andina/frontend/src/app/shared/components/navbar/navbar.component.ts): Common navigation translated.

---

## 🧪 Verification & Results

### 1. Vitest Unit Test Suite
Ran the complete unit test suite across all services, pipes, components, and guards:
```bash
npm run test
```
**Results:**
```
Test Files  26 passed (26)
Tests       129 passed (129)
Duration    1.32s
```
- ✅ `i18n.service.spec.ts`: Default locale, language toggle, dictionary fallback, parameter interpolation, HTML lang attribute synchronization.
- ✅ `translate.pipe.spec.ts`: Dynamic translation transformations and reactive signal updates.
- ✅ `language-switcher.component.spec.ts`: Language selection events and button state.
- ✅ `nav-menu.component.spec.ts`: Localized navigation items across roles and languages.
- ✅ `home.component.spec.ts`: Dynamic section configuration localization.
- ✅ `app.component.spec.ts` & `footer.component.spec.ts`: Localized footer configuration.
- ✅ All existing authentication, guard, and dialog specs continue passing without regression.

### 2. Production Angular Build Check
```bash
npm run build
```
**Results:**
- ✅ Successful build in **2.16s**.
- ✅ Zero TypeScript or Angular compilation errors.
- ✅ All lazy chunks generated cleanly in `dist/andina-frontend`.
