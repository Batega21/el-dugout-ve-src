import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from './footer.interface';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  /**
   * Optional ThemeService to react to dark / light mode changes.
   */
  readonly themeService = inject(ThemeService, { optional: true });

  /**
   * Strongly-typed configuration signal input.
   * Defaults to DEFAULT_FOOTER_CONFIG matching the reference layout.
   */
  readonly config = input<FooterConfig>(DEFAULT_FOOTER_CONFIG);

  /**
   * Background image for dark theme.
   * Defaults to '/public/images/background-3-dark-version'.
   */
  readonly darkImage = input<string>('/public/images/background-3-dark-version');

  /**
   * Background image for light theme.
   * Defaults to '/public/images/background-3-light-version'.
   */
  readonly lightImage = input<string>('/public/images/background-3-light-version');

  /**
   * Resolves the active background image path according to active theme and config overrides.
   */
  readonly currentImage = computed(() => {
    const isDark = this.themeService ? this.themeService.isDark() : true;
    const cfgBg = this.config()?.background;
    if (isDark) {
      return cfgBg?.dark || this.darkImage();
    }
    return cfgBg?.light || this.lightImage();
  });

  /**
   * Resolves the active footer background color: #000000 for dark theme, #FFFFFF for light theme.
   */
  readonly currentBgColor = computed(() => {
    const isDark = this.themeService ? this.themeService.isDark() : true;
    return isDark ? '#000000' : '#FFFFFF';
  });

  /**
   * Computed inline style object for footer background image and color.
   */
  readonly footerBgStyle = computed(() => ({
    'background-image': `url('${this.currentImage()}')`,
    'background-color': this.currentBgColor(),
  }));

  /**
   * Event emitted when the newsletter subscription form is submitted.
   */
  readonly newsletterSubmit = output<string>();

  /**
   * Internal signal tracking newsletter input state.
   */
  protected readonly newsletterEmail = signal<string>('');

  protected onEmailInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newsletterEmail.set(value);
  }

  protected onNewsletterSubmit(): void {
    const email = this.newsletterEmail().trim();
    if (email) {
      this.newsletterSubmit.emit(email);
      this.newsletterEmail.set('');
    }
  }
}
