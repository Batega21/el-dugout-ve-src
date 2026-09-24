import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LogoComponent } from './logo/logo.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, LogoComponent, NavMenuComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss',
})
export class HeaderComponent { }
