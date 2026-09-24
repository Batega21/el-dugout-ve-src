import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './logo.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  readonly title = input<string>('El Dugout Ve');
}
