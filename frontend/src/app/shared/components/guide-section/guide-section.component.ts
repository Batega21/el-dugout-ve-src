import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-guide-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './guide-section.component.html',
  styleUrl: './guide-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideSectionComponent {
  private readonly authService = inject(AuthService);

  /**
   * Optional override for testing or manual visibility control.
   */
  readonly forceVisible = input<boolean | null>(null, { alias: 'force-visible' });

  /**
   * Only visible for users with admin accounts/access.
   */
  readonly canView = computed(() => {
    const forced = this.forceVisible();
    if (forced !== null) {
      return forced;
    }
    return this.authService.isAdmin();
  });
}
