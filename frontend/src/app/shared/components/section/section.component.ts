import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionConfig, DEFAULT_SECTION_CONFIG } from './section.interface';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section
      class="section-container"
      [ngStyle]="sectionStyle()"
      [class.parallax-active]="isParallaxActive()"
      [class.has-custom-bg]="hasCustomBg()">
      <div
        class="section-wrapper"
        [class.align-right]="resolvedAlign() === 'right'">
        <!-- 60% Div: Section Title & Description -->
        <div class="section-portion portion-60">
          @if (resolvedTitle()) {
            <h2 class="section-title">{{ resolvedTitle() | translate }}</h2>
          }
          @if (resolvedDescription()) {
            <p class="section-description">{{ resolvedDescription() | translate }}</p>
          }
          <div class="section-extra-content">
            <ng-content select="[section-body],:not([media-content])"></ng-content>
          </div>
        </div>

        <!-- 40% Div: Layered Media with Background Image (z-index: 1) & Text Content (z-index: 2) -->
        <div class="section-portion portion-40">
          <div class="media-card">
            <!-- Element 1: Image as background (z-index: 1) -->
            @if (resolvedMediaImage()) {
              <img
                [src]="resolvedMediaImage()"
                [alt]="resolvedMediaAlt() | translate"
                class="media-bg-image"
                loading="lazy"
              />
            } @else {
              <div class="media-bg-placeholder"></div>
            }
            <div class="media-gradient-scrim"></div>

            <!-- Element 2: Text content over the image (z-index: 2) -->
            <div class="media-text-content">
              @if (resolvedMediaText()) {
                <p class="media-caption">{{ resolvedMediaText() | translate }}</p>
              }
              <ng-content select="[media-content]"></ng-content>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .section-container {
      width: 100%;
      padding: 4rem 1.5rem;
      box-sizing: border-box;
      position: relative;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      transition: background-color 0.3s ease;
    }

    .section-container.has-custom-bg {
      border-radius: var(--radius-lg, 1.25rem);
      margin: 2rem 0;
    }

    .section-container.parallax-active {
      background-attachment: fixed;
    }

    .section-wrapper {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      justify-content: space-between;
      gap: 2.5rem;
      max-width: var(--wrap-max-width, 1200px);
      margin: 0 auto;
      box-sizing: border-box;

      &.align-right {
        flex-direction: row-reverse;
      }
    }

    /* 60% & 40% Proportions */
    .portion-60 {
      flex: 0 0 calc(60% - 1.25rem);
      width: calc(60% - 1.25rem);
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
    }

    .portion-40 {
      flex: 0 0 calc(40% - 1.25rem);
      width: calc(40% - 1.25rem);
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    /* 60% Content Styling */
    .section-title {
      font-family: var(--font-display);
      font-size: clamp(1.85rem, 3.5vw, var(--font-size-3xl, 2.5rem));
      font-weight: var(--font-weight-bold, 700);
      line-height: var(--line-height-tight, 1.2);
      letter-spacing: -0.025em;
      color: var(--text-color, #ffffff);
      margin: 0 0 1rem 0;
    }

    .section-description {
      font-family: var(--font-sans);
      font-size: clamp(1rem, 1.8vw, var(--font-size-md, 1.125rem));
      line-height: var(--line-height-relaxed, 1.65);
      color: var(--text-secondary-color, #94a3b8);
      margin: 0 0 1.25rem 0;
    }

    .section-extra-content {
      display: contents;
    }

    /* 40% Layered Media Card */
    .media-card {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 280px;
      border-radius: var(--radius-lg, 1rem);
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      padding: 1.75rem;
      box-sizing: border-box;
      border: 1px solid var(--border-theme-color, rgba(255, 255, 255, 0.12));
      box-shadow: var(--shadow-card, 0 10px 30px -5px rgba(0, 0, 0, 0.35));
      background-color: var(--background-card-color, #1e293b);
    }

    /* Element 1: Image as background (z-index: 1) */
    .media-bg-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
      transition: transform 0.4s ease;
    }

    .media-card:hover .media-bg-image {
      transform: scale(1.03);
    }

    .media-bg-placeholder {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%);
    }

    .media-gradient-scrim {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.1) 0%,
        rgba(15, 23, 42, 0.6) 50%,
        rgba(15, 23, 42, 0.92) 100%
      );
      pointer-events: none;
    }

    /* Element 2: Text content over the image (z-index: 2) */
    .media-text-content {
      position: relative;
      z-index: 2;
      width: 100%;
      box-sizing: border-box;
    }

    .media-caption {
      font-size: 1.05rem;
      font-weight: 600;
      line-height: 1.5;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }

    /* Responsive Stacking for Tablets & Mobile */
    @media (max-width: 960px) {
      .section-container {
        padding: 3rem 1rem;
      }

      .section-wrapper {
        flex-direction: column !important;
        gap: 2rem;
      }

      .portion-60,
      .portion-40 {
        flex: 0 0 100%;
        width: 100%;
      }

      .media-card {
        min-height: 240px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionComponent {
  // Strongly-typed configuration input (matching footer pattern: <app-section [config]="mySectionData"></app-section>)
  readonly config = input<SectionConfig>(DEFAULT_SECTION_CONFIG);

  // Alignment: 'left' (60% left, 40% right) or 'right' (60% right, 40% left)
  readonly sectionAlign = input<'left' | 'right'>('left', {
    alias: 'section-align',
  });

  // Section background: Solid color or image URL
  readonly sectionBackground = input<string | null>(null, {
    alias: 'section-background',
  });

  // Parallax flag: Only applies if section-background is an image
  readonly parallax = input<boolean, unknown>(false, {
    transform: booleanAttribute,
    alias: 'parallax',
  });

  // 60% Div Content Inputs (supporting direct & aliased properties)
  readonly title = input<string>('');
  readonly sectionTitle = input<string>('', { alias: 'section-title' });

  readonly description = input<string>('');
  readonly sectionDescription = input<string>('', { alias: 'section-description' });

  // 40% Div Content Inputs (supporting direct & aliased properties)
  readonly mediaImage = input<string>('', { alias: 'media-image' });
  readonly image = input<string>('');

  readonly mediaText = input<string>('', { alias: 'media-text' });
  readonly text = input<string>('');

  // Resolved values prioritizing config() object, falling back to direct inputs
  readonly resolvedAlign = computed<'left' | 'right'>(() => {
    return this.config()?.align || this.sectionAlign() || 'left';
  });

  readonly resolvedBackground = computed<string | null>(() => {
    const cfg = this.config();
    if (cfg && cfg.background !== undefined) {
      return cfg.background;
    }
    return this.sectionBackground();
  });

  readonly resolvedParallax = computed<boolean>(() => {
    const cfg = this.config();
    if (cfg && cfg.parallax !== undefined) {
      return cfg.parallax;
    }
    return Boolean(this.parallax());
  });

  readonly resolvedTitle = computed(() => {
    return this.config()?.title || this.sectionTitle() || this.title() || '';
  });

  readonly resolvedDescription = computed(() => {
    return (
      this.config()?.description ||
      this.sectionDescription() ||
      this.description() ||
      ''
    );
  });

  readonly resolvedMediaImage = computed(() => {
    return (
      this.config()?.media?.image ||
      this.config()?.mediaImage ||
      this.mediaImage() ||
      this.image() ||
      ''
    );
  });

  readonly resolvedMediaText = computed(() => {
    return (
      this.config()?.media?.text ||
      this.config()?.mediaText ||
      this.mediaText() ||
      this.text() ||
      ''
    );
  });

  readonly resolvedMediaAlt = computed(() => {
    return this.config()?.media?.alt || 'Section media illustration';
  });

  // Detects if sectionBackground is an image URL
  readonly isImageBackground = computed(() => {
    const bg = this.resolvedBackground();
    if (!bg) return false;
    const trimmed = bg.trim().toLowerCase();
    return (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('./') ||
      trimmed.startsWith('../') ||
      trimmed.startsWith('assets/') ||
      trimmed.startsWith('url(') ||
      trimmed.endsWith('.png') ||
      trimmed.endsWith('.jpg') ||
      trimmed.endsWith('.jpeg') ||
      trimmed.endsWith('.webp') ||
      trimmed.endsWith('.svg') ||
      trimmed.endsWith('.avif')
    );
  });

  readonly hasCustomBg = computed(() => !!this.resolvedBackground());

  readonly isParallaxActive = computed(
    () => Boolean(this.resolvedParallax()) && this.isImageBackground()
  );

  // Computes inline styles for section background & parallax attachment
  readonly sectionStyle = computed<Record<string, string | undefined>>(() => {
    const bg = this.resolvedBackground();
    if (!bg) {
      return {};
    }

    if (this.isImageBackground()) {
      const formattedUrl = bg.startsWith('url(') ? bg : `url('${bg}')`;
      return {
        'background-image': formattedUrl,
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-attachment': this.resolvedParallax() ? 'fixed' : 'scroll',
      };
    }

    return {
      'background-color': bg,
    };
  });
}
