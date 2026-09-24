import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from './shared/components/footer/footer.interface';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /**
   * Initializes theme engine upon application boot.
   */
  readonly themeService = inject(ThemeService);

  /**
   * Initializes i18n language service and loads preference from localStorage.
   */
  readonly languageService = inject(LanguageService);

  /**
   * Reusable footer configuration passed into the FooterComponent via Signal input.
   */
  readonly footerData: FooterConfig = DEFAULT_FOOTER_CONFIG;
}

