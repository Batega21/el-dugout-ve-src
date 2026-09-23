import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from './footer.interface';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <!-- Upper Section: Main Content Grid -->
      <div class="footer-main">
        <div class="footer-container main-grid">
          <!-- Column 1: Brand & Slogan + About Us -->
          @if (config().brand; as brand) {
            <div class="footer-col brand-col">
              <div class="brand-block">
                <h2 class="brand-name">{{ brand.name | translate }}</h2>
                @if (brand.slogan) {
                  <p class="brand-slogan">{{ brand.slogan | translate }}</p>
                }
              </div>

              @if (brand.aboutTitle || brand.aboutText) {
                <div class="about-block">
                  @if (brand.aboutTitle) {
                    <h3 class="col-title">{{ brand.aboutTitle | translate }}</h3>
                  }
                  @if (brand.aboutText) {
                    <p class="about-text">{{ brand.aboutText | translate }}</p>
                  }
                </div>
              }
            </div>
          }

          <!-- Column 2 & 3: Link Sections (e.g. Services, Company) -->
          @if (config().sections; as sections) {
            @for (section of sections; track section.title) {
              <div class="footer-col links-col">
                <h3 class="col-title">{{ section.title | translate }}</h3>
                <ul class="bullet-list">
                  @for (link of section.links; track link.label) {
                    <li class="bullet-item">
                      @if (link.external) {
                        <a [href]="link.url" target="_blank" rel="noopener" class="footer-link">
                          {{ link.label | translate }}
                        </a>
                      } @else {
                        <a [routerLink]="link.url" class="footer-link">
                          {{ link.label | translate }}
                        </a>
                      }
                    </li>
                  }
                </ul>
              </div>
            }
          }

          <!-- Column 4: Contact Information -->
          @if (config().contact; as contact) {
            <div class="footer-col contact-col">
              <h3 class="col-title">{{ contact.title | translate }}</h3>
              <div class="contact-items">
                @for (item of contact.items; track item.label) {
                  <div class="contact-entry">
                    <span class="contact-label">{{ item.label | translate }}</span>
                    @if (item.href) {
                      <a [href]="item.href" class="contact-value link">{{ item.value }}</a>
                    } @else {
                      <span class="contact-value">{{ item.value }}</span>
                    }
                  </div>
                }
              </div>
              @if (contact.showAccentBar) {
                <div class="contact-accent-bar"></div>
              }
            </div>
          }

          <!-- Column 5: Newsletter & Social -->
          <div class="footer-col action-col">
            @if (config().newsletter; as newsletter) {
              <div class="newsletter-box">
                <input
                  type="email"
                  class="newsletter-input"
                  [placeholder]="(newsletter.placeholder || 'Write Email') | translate"
                  [value]="newsletterEmail()"
                  (input)="onEmailInput($event)"
                  (keydown.enter)="onNewsletterSubmit()"
                  [attr.aria-label]="(newsletter.placeholder || 'Write Email') | translate"
                />
                <button
                  type="button"
                  class="newsletter-submit-btn"
                  [attr.aria-label]="(newsletter.buttonAriaLabel || 'Subscribe') | translate"
                  (click)="onNewsletterSubmit()">
                  <mat-icon class="submit-icon">arrow_forward</mat-icon>
                </button>
              </div>
            }

            @if (config().social; as social) {
              <div class="social-block">
                <div class="social-circles">
                  @for (item of social.items; track item.name) {
                    <a
                      [href]="item.url"
                      target="_blank"
                      rel="noopener"
                      class="social-circle"
                      [class.highlighted]="item.highlighted"
                      [attr.aria-label]="item.name">
                      @if (item.icon) {
                        <mat-icon class="social-icon">{{ item.icon }}</mat-icon>
                      } @else {
                        <span class="social-symbol">{{ item.symbol }}</span>
                      }
                    </a>
                  }
                </div>
                @if (social.title) {
                  <h3 class="social-title">{{ social.title | translate }}</h3>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Bottom Bar: Links & Copyright -->
      @if (config().bottom; as bottom) {
        <div class="footer-bottom">
          <div class="footer-container bottom-bar">
            <nav class="bottom-links" aria-label="Footer Secondary Links">
              @for (link of bottom.links; track link.label; let last = $last) {
                @if (link.external) {
                  <a [href]="link.url" target="_blank" rel="noopener" class="bottom-link">
                    {{ link.label | translate }}
                  </a>
                } @else {
                  <a [routerLink]="link.url" class="bottom-link">
                    {{ link.label | translate }}
                  </a>
                }
                @if (!last) {
                  <span class="pipe-separator">|</span>
                }
              }
            </nav>

            <div class="copyright-notice">
              {{ bottom.copyright | translate }}
            </div>
          </div>
        </div>
      }
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      margin-top: auto;
      --f-surface: var(--background-card-color, var(--bg-card));
      --f-on-surface: var(--text-color, var(--text-primary));
      --f-muted: var(--text-secondary-color, var(--text-secondary));
      --f-dim: var(--text-muted-color, var(--text-muted));
      --f-border: var(--border-theme-color, var(--border-color));
      --f-primary: var(--primary-color, var(--primary));
      --f-on-primary: var(--text-color, #ffffff);
    }
    .footer-container { max-width: var(--wrap-max-width, 1200px); margin: 0 auto; padding: 0 var(--wrap-padding-x, 1.25rem); }
    .footer-main { background: var(--f-surface); color: var(--f-on-surface); border-top: 1px solid var(--f-border); padding: 4rem 0 3.5rem; }
    .main-grid { display: grid; grid-template-columns: 2.2fr 1.2fr 1.2fr 1.4fr 1.6fr; gap: 2.5rem; }
    .footer-col, .bullet-list, .contact-items, .action-col, .social-block { display: flex; flex-direction: column; }
    .bullet-item, .newsletter-submit-btn, .social-circles, .social-circle, .bottom-bar, .bottom-links { display: flex; align-items: center; }
    .col-title, .social-title, .contact-label, .social-circle, .pipe-separator { font-weight: var(--font-weight-bold, 700); }
    .col-title, .social-title { font-family: var(--font-display); font-size: var(--font-size-md, 1.125rem); color: var(--f-on-surface); }
    .col-title { margin-bottom: 1.25rem; }
    .brand-block { margin-bottom: 2rem; }
    .brand-name { font-family: var(--font-display); font-size: 1.85rem; font-weight: var(--font-weight-extrabold, 900); text-transform: uppercase; color: var(--f-on-surface); margin-bottom: 0.35rem; }
    .brand-slogan { font-size: var(--font-size-sm, 0.95rem); font-weight: var(--font-weight-semibold, 600); color: var(--f-primary); }
    .about-text, .bullet-item, .footer-link, .contact-value, .bottom-link { font-family: var(--font-sans); font-size: var(--font-size-sm, 0.875rem); color: var(--f-muted); }
    .about-text { line-height: 1.6; max-width: 320px; }
    .bullet-list { list-style: none; gap: 0.75rem; }
    .bullet-item { gap: 0.5rem; }
    .bullet-item::before { content: '•'; color: var(--f-dim); font-size: 1rem; line-height: 1; }
    .footer-link, .bottom-link, .contact-value { text-decoration: none; }
    .footer-link:hover, .bottom-link:hover, .contact-value.link:hover { color: var(--f-primary); }
    .contact-items { gap: 1rem; margin-bottom: 1.5rem; }
    .contact-label { font-size: var(--font-size-sm, 0.875rem); color: var(--f-on-surface); }
    .contact-accent-bar { width: 3.25rem; height: 6px; background: var(--f-primary); border-radius: var(--radius-sm, 6px); }
    .action-col { gap: 2rem; }
    .newsletter-box { display: flex; background: var(--background-hover-color, var(--bg-card-hover)); border-radius: var(--radius-sm, 6px); overflow: hidden; border: 1px solid var(--f-border); max-width: 280px; width: 100%; }
    .newsletter-input { flex: 1; background: transparent; border: none; padding: 0.75rem 0.85rem; font-size: 1rem; color: var(--f-on-surface); outline: none; }
    .newsletter-input::placeholder { color: var(--f-dim); }
    .newsletter-submit-btn { background: var(--f-primary); border: none; color: var(--f-on-primary); padding: 0 1rem; min-width: 44px; min-height: 44px; justify-content: center; cursor: pointer; }
    .submit-icon, .social-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    .social-block { gap: 1.25rem; }
    .social-circles { gap: 0.65rem; flex-wrap: wrap; }
    .social-circle { width: 2.35rem; height: 2.35rem; border-radius: 50%; border: 1px solid var(--f-border); background: var(--background-hover-color, var(--bg-card-hover)); color: var(--f-muted); justify-content: center; text-decoration: none; font-size: var(--font-size-sm, 0.85rem); transition: all 0.2s; }
    .social-circle:hover { border-color: var(--f-primary); color: var(--f-primary); transform: translateY(-2px); }
    .social-circle.highlighted { background: var(--f-primary); border-color: var(--f-primary); color: var(--f-on-primary); }
    .footer-bottom { background: var(--background-primary-color, var(--bg-main)); border-top: 1px solid var(--f-border); padding: 1.35rem 0; color: var(--f-dim); font-size: var(--font-size-xs, 0.825rem); }
    .bottom-bar, .bottom-links { flex-wrap: wrap; }
    .bottom-bar { justify-content: space-between; gap: 1rem; }
    .pipe-separator { color: var(--f-primary); margin: 0 0.85rem; user-select: none; }
    @media (max-width: 1024px) {
      .main-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
      .brand-col { grid-column: span 2; }
    }
    @media (max-width: 680px) {
      .footer-main { padding: 2.5rem 0 2rem; }
      .main-grid { grid-template-columns: repeat(2, 1fr); }
      .action-col { grid-column: 1/-1; }
      .newsletter-box { max-width: 100%; }
      .bottom-bar { flex-direction: column; align-items: flex-start; }
      .pipe-separator { display: none; }
      .bottom-links { gap: 0.5rem 1rem; }
    }
  `],
})
export class FooterComponent {
  /**
   * Strongly-typed configuration signal input.
   * Defaults to DEFAULT_FOOTER_CONFIG matching the reference layout.
   */
  readonly config = input<FooterConfig>(DEFAULT_FOOTER_CONFIG);

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
