import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, SupportedLanguage } from '../../../../core/services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="language-switcher"
      role="group"
      [attr.aria-label]="'COMMON.LANGUAGE.SWITCHER_LABEL' | translate">
      
      <!-- 🇻🇪 Spanish (Venezuela) Flag Toggle -->
      <button
        type="button"
        class="lang-btn"
        [class.active]="selectedLang() === 'es'"
        [attr.aria-pressed]="selectedLang() === 'es'"
        [attr.aria-label]="selectedLang() === 'es' ? ('COMMON.LANGUAGE.SPANISH_SELECTED' | translate) : ('COMMON.LANGUAGE.SWITCH_TO_SPANISH' | translate)"
        [title]="selectedLang() === 'es' ? ('COMMON.LANGUAGE.SPANISH_SELECTED' | translate) : ('COMMON.LANGUAGE.SWITCH_TO_SPANISH' | translate)"
        (click)="setLang('es')">
        
        <span class="flag-wrapper" aria-hidden="true">
          <!-- Venezuela Flag SVG (High Precision Vector) -->
          <svg class="flag-svg" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <g id="vz-star">
                <polygon
                  points="0,-12 3.5,-3.7 11.4,-3.7 5,1.5 7.4,9.7 0,4.6 -7.4,9.7 -5,1.5 -11.4,-3.7 -3.5,-3.7"
                  fill="#ffffff"
                />
              </g>
            </defs>
            <!-- Yellow Top Band -->
            <rect width="640" height="160" y="0" fill="#FFCC00" />
            <!-- Blue Middle Band -->
            <rect width="640" height="160" y="160" fill="#00247D" />
            <!-- Red Bottom Band -->
            <rect width="640" height="160" y="320" fill="#CF142B" />

            <!-- Arc of 8 White Stars in Blue Stripe -->
            <g transform="translate(320, 275)">
              <use href="#vz-star" transform="rotate(-63) translate(0, -78)" />
              <use href="#vz-star" transform="rotate(-45) translate(0, -78)" />
              <use href="#vz-star" transform="rotate(-27) translate(0, -78)" />
              <use href="#vz-star" transform="rotate(-9) translate(0, -78)" />
              <use href="#vz-star" transform="rotate(9) translate(0, -78)" />
              <use href="#vz-star" transform="rotate(27) translate(0, -78)" />
              <use href="#vz-star" transform="rotate(45) translate(0, -78)" />
              <use href="#vz-star" transform="rotate(63) translate(0, -78)" />
            </g>
          </svg>
        </span>
        <span class="lang-text">ES</span>
      </button>

      <!-- 🇺🇸 English (USA) Flag Toggle -->
      <button
        type="button"
        class="lang-btn"
        [class.active]="selectedLang() === 'en'"
        [attr.aria-pressed]="selectedLang() === 'en'"
        [attr.aria-label]="selectedLang() === 'en' ? ('COMMON.LANGUAGE.ENGLISH_SELECTED' | translate) : ('COMMON.LANGUAGE.SWITCH_TO_ENGLISH' | translate)"
        [title]="selectedLang() === 'en' ? ('COMMON.LANGUAGE.ENGLISH_SELECTED' | translate) : ('COMMON.LANGUAGE.SWITCH_TO_ENGLISH' | translate)"
        (click)="setLang('en')">
        
        <span class="flag-wrapper" aria-hidden="true">
          <!-- USA Flag SVG (High Precision Vector) -->
          <svg class="flag-svg" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <g id="us-star">
                <polygon
                  points="0,-8 2.3,-2.5 7.6,-2.5 3.3,1 4.9,6.5 0,3.1 -4.9,6.5 -3.3,1 -7.6,-2.5 -2.3,-2.5"
                  fill="#ffffff"
                />
              </g>
            </defs>
            <!-- 13 Alternating Red & White Stripes -->
            <rect width="640" height="480" fill="#B22234" />
            <rect width="640" height="36.92" y="36.92" fill="#FFFFFF" />
            <rect width="640" height="36.92" y="110.76" fill="#FFFFFF" />
            <rect width="640" height="36.92" y="184.6" fill="#FFFFFF" />
            <rect width="640" height="36.92" y="258.44" fill="#FFFFFF" />
            <rect width="640" height="36.92" y="332.28" fill="#FFFFFF" />
            <rect width="640" height="36.92" y="406.12" fill="#FFFFFF" />

            <!-- Blue Canton (Union) -->
            <rect width="260" height="258.46" fill="#3C3B6E" />

            <!-- Grid of 50 Stars in Blue Canton -->
            <g transform="translate(10, 8)">
              <!-- Row 1 (6 stars) -->
              <use href="#us-star" x="20" y="18" />
              <use href="#us-star" x="60" y="18" />
              <use href="#us-star" x="100" y="18" />
              <use href="#us-star" x="140" y="18" />
              <use href="#us-star" x="180" y="18" />
              <use href="#us-star" x="220" y="18" />

              <!-- Row 2 (5 stars) -->
              <use href="#us-star" x="40" y="42" />
              <use href="#us-star" x="80" y="42" />
              <use href="#us-star" x="120" y="42" />
              <use href="#us-star" x="160" y="42" />
              <use href="#us-star" x="200" y="42" />

              <!-- Row 3 (6 stars) -->
              <use href="#us-star" x="20" y="66" />
              <use href="#us-star" x="60" y="66" />
              <use href="#us-star" x="100" y="66" />
              <use href="#us-star" x="140" y="66" />
              <use href="#us-star" x="180" y="66" />
              <use href="#us-star" x="220" y="66" />

              <!-- Row 4 (5 stars) -->
              <use href="#us-star" x="40" y="90" />
              <use href="#us-star" x="80" y="90" />
              <use href="#us-star" x="120" y="90" />
              <use href="#us-star" x="160" y="90" />
              <use href="#us-star" x="200" y="90" />

              <!-- Row 5 (6 stars) -->
              <use href="#us-star" x="20" y="114" />
              <use href="#us-star" x="60" y="114" />
              <use href="#us-star" x="100" y="114" />
              <use href="#us-star" x="140" y="114" />
              <use href="#us-star" x="180" y="114" />
              <use href="#us-star" x="220" y="114" />

              <!-- Row 6 (5 stars) -->
              <use href="#us-star" x="40" y="138" />
              <use href="#us-star" x="80" y="138" />
              <use href="#us-star" x="120" y="138" />
              <use href="#us-star" x="160" y="138" />
              <use href="#us-star" x="200" y="138" />

              <!-- Row 7 (6 stars) -->
              <use href="#us-star" x="20" y="162" />
              <use href="#us-star" x="60" y="162" />
              <use href="#us-star" x="100" y="162" />
              <use href="#us-star" x="140" y="162" />
              <use href="#us-star" x="180" y="162" />
              <use href="#us-star" x="220" y="162" />

              <!-- Row 8 (5 stars) -->
              <use href="#us-star" x="40" y="186" />
              <use href="#us-star" x="80" y="186" />
              <use href="#us-star" x="120" y="186" />
              <use href="#us-star" x="160" y="186" />
              <use href="#us-star" x="200" y="186" />

              <!-- Row 9 (6 stars) -->
              <use href="#us-star" x="20" y="210" />
              <use href="#us-star" x="60" y="210" />
              <use href="#us-star" x="100" y="210" />
              <use href="#us-star" x="140" y="210" />
              <use href="#us-star" x="180" y="210" />
              <use href="#us-star" x="220" y="210" />
            </g>
          </svg>
        </span>
        <span class="lang-text">EN</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
    }

    .language-switcher {
      display: inline-flex;
      align-items: center;
      background: var(--background-hover-color, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
      border-radius: var(--radius-pill, 9999px);
      padding: 3px;
      gap: 3px;
      transition: border-color 0.2s ease, background-color 0.2s ease;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }

    .lang-btn {
      background: transparent;
      border: 1.5px solid transparent;
      border-radius: var(--radius-pill, 9999px);
      padding: 3px 8px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: var(--text-secondary-color, var(--text-secondary, #9ca3af));
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      height: 30px;

      &:hover:not(.active) {
        color: var(--text-color, var(--text-primary, #ffffff));
        background: rgba(255, 255, 255, 0.08);
        transform: scale(1.04);
      }

      &:focus-visible {
        box-shadow: 0 0 0 2px var(--background-primary-color), 0 0 0 4px var(--primary-color, #ef4444);
      }

      &.active {
        background: rgba(239, 68, 68, 0.14);
        border-color: var(--primary-color, #ef4444);
        color: #ffffff;
        font-weight: 700;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.35);

        .flag-wrapper {
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }
      }
    }

    .flag-wrapper {
      width: 22px;
      height: 15px;
      border-radius: 2.5px;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .flag-svg {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    .lang-text {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1;
    }
  `],
})
export class LanguageToggleComponent {
  private readonly languageService = inject(LanguageService);

  readonly selectedLang = computed(() => this.languageService.selectedLang());

  setLang(lang: SupportedLanguage): void {
    this.languageService.setLanguage(lang);
  }
}
