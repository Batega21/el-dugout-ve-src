import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from './shared/components/footer/footer.interface';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-header></app-header>
      <main class="main-content">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
      <app-footer [config]="footerData"></app-footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
    }
  `],
})
export class AppComponent {
  /**
   * Initializes theme engine upon application boot.
   */
  readonly themeService = inject(ThemeService);

  /**
   * Reusable footer configuration passed into the FooterComponent via Signal input.
   */
  readonly footerData: FooterConfig = DEFAULT_FOOTER_CONFIG;
}

