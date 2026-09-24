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
  templateUrl: './section.component.html',
  styleUrl: './section.component.scss',
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
