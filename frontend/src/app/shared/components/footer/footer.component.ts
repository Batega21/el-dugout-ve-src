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
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
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
