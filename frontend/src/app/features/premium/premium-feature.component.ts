import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-premium-feature',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './premium-feature.component.html',
  styleUrl: './premium-feature.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumFeatureComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly featureData = signal<any>(null);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.http.get('features/premium').subscribe({
      next: (data) => {
        this.featureData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Access Denied: Insufficient Tier');
      },
    });
  }
}
