import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="theme-toggle-btn"
      [class.is-dark]="themeService.isDark()"
      [class.is-light]="themeService.isLight()"
      [class.animating]="isSpinning()"
      [attr.aria-label]="themeService.isDark() ? 'Activar tema claro (Pelota Clásica)' : 'Activar tema oscuro (Pelota Luminosa Amarilla)'"
      [attr.title]="themeService.isDark() ? 'Tema Oscuro: Pelota luminosa amarilla. Clic para cambiar a claro.' : 'Tema Claro: Pelota clásica. Clic para cambiar a oscuro.'"
      [attr.aria-pressed]="themeService.isDark()"
      role="switch"
      [attr.aria-checked]="themeService.isDark()"
      (click)="toggleTheme()">
      
      <div class="baseball-wrapper">
        <!-- Ambient Yellow Glow Aura for Dark Theme -->
        <div class="yellow-glow-ring" aria-hidden="true"></div>
        <div class="yellow-light-rays" aria-hidden="true"></div>

        <!-- High-Fidelity Baseball SVG -->
        <svg
          class="baseball-svg"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          
          <defs>
            <!-- Normal Baseball Gradient (Light Mode) -->
            <radialGradient id="normalBaseballGrad" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="65%" stop-color="#f8fafc" />
              <stop offset="90%" stop-color="#e2e8f0" />
              <stop offset="100%" stop-color="#cbd5e1" />
            </radialGradient>

            <!-- Bright Yellow Baseball Gradient (Dark Mode) -->
            <radialGradient id="brightYellowGrad" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="25%" stop-color="#fef08a" />
              <stop offset="65%" stop-color="#facc15" />
              <stop offset="90%" stop-color="#eab308" />
              <stop offset="100%" stop-color="#ca8a04" />
            </radialGradient>

            <!-- Ball Depth Shadow -->
            <radialGradient id="ballShading" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stop-color="transparent" />
              <stop offset="100%" stop-color="rgba(0, 0, 0, 0.28)" />
            </radialGradient>
          </defs>

          <!-- Baseball Sphere -->
          <circle
            class="baseball-sphere"
            cx="50"
            cy="50"
            r="44"
          />

          <!-- 3D Spherical Edge Shadow Overlay -->
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="url(#ballShading)"
            pointer-events="none"
          />

          <!-- Left Seam Arc -->
          <path
            class="baseball-seam"
            d="M 27 12 C 41 34 41 66 27 88"
            stroke-width="2.5"
            stroke-linecap="round"
            fill="none"
          />

          <!-- Right Seam Arc -->
          <path
            class="baseball-seam"
            d="M 73 12 C 59 34 59 66 73 88"
            stroke-width="2.5"
            stroke-linecap="round"
            fill="none"
          />

          <!-- Left Seam Chevron Stitches -->
          <g class="baseball-stitches left-stitches" stroke-width="2" stroke-linecap="round">
            <line x1="28" y1="18" x2="33" y2="21" />
            <line x1="28" y1="18" x2="23" y2="21" />

            <line x1="32" y1="28" x2="37" y2="31" />
            <line x1="32" y1="28" x2="27" y2="31" />

            <line x1="34" y1="39" x2="40" y2="41" />
            <line x1="34" y1="39" x2="29" y2="41" />

            <line x1="35" y1="50" x2="41" y2="50" />
            <line x1="35" y1="50" x2="29" y2="50" />

            <line x1="34" y1="61" x2="40" y2="59" />
            <line x1="34" y1="61" x2="29" y2="59" />

            <line x1="32" y1="72" x2="37" y2="69" />
            <line x1="32" y1="72" x2="27" y2="69" />

            <line x1="28" y1="82" x2="33" y2="79" />
            <line x1="28" y1="82" x2="23" y2="79" />
          </g>

          <!-- Right Seam Chevron Stitches -->
          <g class="baseball-stitches right-stitches" stroke-width="2" stroke-linecap="round">
            <line x1="72" y1="18" x2="67" y2="21" />
            <line x1="72" y1="18" x2="77" y2="21" />

            <line x1="68" y1="28" x2="63" y2="31" />
            <line x1="68" y1="28" x2="73" y2="31" />

            <line x1="66" y1="39" x2="60" y2="41" />
            <line x1="66" y1="39" x2="71" y2="41" />

            <line x1="65" y1="50" x2="59" y2="50" />
            <line x1="65" y1="50" x2="71" y2="50" />

            <line x1="66" y1="61" x2="60" y2="59" />
            <line x1="66" y1="61" x2="71" y2="59" />

            <line x1="68" y1="72" x2="63" y2="69" />
            <line x1="68" y1="72" x2="73" y2="69" />

            <line x1="72" y1="82" x2="67" y2="79" />
            <line x1="72" y1="82" x2="77" y2="79" />
          </g>

          <!-- Luminous Light Flare on the Upper Left (Only visible when glowing) -->
          <circle class="baseball-glint" cx="36" cy="30" r="4.5" fill="#ffffff" />
        </svg>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .theme-toggle-btn {
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      outline: none;
      position: relative;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover {
        transform: scale(1.08);
      }

      &:active {
        transform: scale(0.96);
      }

      &:focus-visible {
        box-shadow: 0 0 0 2px var(--background-primary-color), 0 0 0 4px var(--primary);
      }
    }

    .baseball-wrapper {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .baseball-svg {
      width: 36px;
      height: 36px;
      display: block;
      transition: filter 0.3s ease, transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, filter;
    }

    /* Click Spin Animation */
    .animating .baseball-svg {
      transform: rotate(360deg) scale(1.12);
    }

    // =========================================================================
    // LIGHT THEME: NORMAL BASEBALL BALL
    // =========================================================================
    .is-light {
      .baseball-sphere {
        fill: url(#normalBaseballGrad);
        stroke: #cbd5e1;
        stroke-width: 1;
      }

      .baseball-seam {
        stroke: #dc2626;
      }

      .baseball-stitches {
        stroke: #b91c1c;
      }

      .baseball-glint {
        opacity: 0.35;
      }

      .baseball-svg {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.16));
      }

      .yellow-glow-ring,
      .yellow-light-rays {
        opacity: 0;
        visibility: hidden;
      }
    }

    // =========================================================================
    // DARK THEME: BRIGHT BASEBALL BALL (YELLOW LIGHT)
    // =========================================================================
    .is-dark {
      .baseball-sphere {
        fill: url(#brightYellowGrad);
        stroke: #fef08a;
        stroke-width: 1.5;
      }

      .baseball-seam {
        stroke: #b91c1c;
      }

      .baseball-stitches {
        stroke: #991b1b;
      }

      .baseball-glint {
        opacity: 0.95;
        filter: drop-shadow(0 0 4px #ffffff);
      }

      /* Radiant Yellow Glow on the Baseball Ball */
      .baseball-svg {
        filter:
          drop-shadow(0 0 6px #facc15)
          drop-shadow(0 0 14px rgba(250, 204, 21, 0.85))
          drop-shadow(0 0 22px rgba(234, 179, 8, 0.6));
      }

      /* Pulsing Yellow Light Rings */
      .yellow-glow-ring {
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(250, 204, 21, 0.45) 0%, rgba(234, 179, 8, 0.15) 60%, transparent 80%);
        pointer-events: none;
        opacity: 1;
        visibility: visible;
        animation: yellow-beacon 2.6s infinite ease-in-out;
      }

      .yellow-light-rays {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(254, 240, 138, 0.3) 0%, rgba(250, 204, 21, 0.1) 70%, transparent 100%);
        pointer-events: none;
        opacity: 1;
        visibility: visible;
        animation: yellow-beacon-slow 3.4s infinite ease-in-out;
      }
    }

    @keyframes yellow-beacon {
      0%, 100% {
        transform: scale(1);
        opacity: 0.75;
      }
      50% {
        transform: scale(1.18);
        opacity: 1;
      }
    }

    @keyframes yellow-beacon-slow {
      0%, 100% {
        transform: scale(1.05);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.28);
        opacity: 0.85;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .baseball-svg {
        transition: none !important;
      }
      .animating .baseball-svg {
        transform: none !important;
      }
      .yellow-glow-ring,
      .yellow-light-rays {
        animation: none !important;
      }
    }
  `],
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  /**
   * Temporary animation signal when clicking to toggle.
   */
  readonly isSpinning = signal<boolean>(false);

  toggleTheme(): void {
    this.isSpinning.set(true);
    this.themeService.toggleTheme();

    setTimeout(() => {
      this.isSpinning.set(false);
    }, 450);
  }
}
