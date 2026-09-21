import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { of } from 'rxjs';
import { SectionCardsComponent } from './section-cards.component';
import { AuthService } from '../../../core/services/auth.service';
import { HealthService } from '../../../core/services/health.service';
import { User } from '../../../core/models/user.model';
import { DEFAULT_SECTION_CARDS_CONFIG, SectionCardsConfig } from './section-cards.interface';

describe('SectionCardsComponent', () => {
  let component: SectionCardsComponent;
  let injector: Injector;

  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
    isAdmin: () => boolean;
    isLoggedIn: () => boolean;
  };

  let mockHealthService: {
    getHealth: any;
  };

  beforeEach(() => {
    const userSignal = signal<User | null>(null);

    mockAuthService = {
      currentUser: userSignal,
      isAdmin: () => userSignal()?.role === 'ADMIN',
      isLoggedIn: () => !!userSignal(),
    };

    mockHealthService = {
      getHealth: vi.fn().mockReturnValue(
        of({
          status: 'ok',
          info: { database: { status: 'up' } },
          details: { database: { status: 'up' } },
        })
      ),
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: HealthService, useValue: mockHealthService },
      ],
    });

    component = runInInjectionContext(injector, () => new SectionCardsComponent());
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load DEFAULT_SECTION_CARDS_CONFIG by default', () => {
    const config = component.effectiveConfig();
    expect(config.adminOnly).toBe(true);
    expect(config.indicatorText).toBe('Admin Access: System Health Matrix');
    expect(config.cards.length).toBe(3);
    expect(config.cards[0].id).toBe('frontend');
    expect(config.cards[1].id).toBe('backend');
    expect(config.cards[2].id).toBe('database');
  });

  it('should not allow viewing when adminOnly is true and user is unauthenticated or standard user', () => {
    expect(component.canView()).toBe(false);

    mockAuthService.currentUser.set({
      id: 'u-1',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    expect(component.canView()).toBe(false);
  });

  it('should allow viewing when user is ADMIN', () => {
    mockAuthService.currentUser.set({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    expect(component.canView()).toBe(true);
  });

  it('should allow viewing when forceVisible is true regardless of auth', () => {
    (component as any).forceVisible = signal(true);
    expect(component.canView()).toBe(true);
  });

  it('should allow viewing when config.adminOnly is false', () => {
    (component as any).config = signal<SectionCardsConfig>({
      adminOnly: false,
      cards: [
        {
          id: 'card-1',
          title: 'Public Feature',
          description: 'Visible to everyone.',
        },
      ],
    });

    expect(component.canView()).toBe(true);
    expect(component.effectiveConfig().cards.length).toBe(1);
  });

  it('should resolve dynamic status badges for backend and database cards', () => {
    component.apiStatus.set('Connected');
    component.dbStatus.set('Connected');

    const backendCard = component.effectiveConfig().cards.find((c) => c.id === 'backend')!;
    const dbCard = component.effectiveConfig().cards.find((c) => c.id === 'database')!;

    const backendBadge = component.getCardBadge(backendCard);
    expect(backendBadge?.text).toBe('Connected');
    expect(backendBadge?.type).toBe('success');

    const dbBadge = component.getCardBadge(dbCard);
    expect(dbBadge?.text).toBe('Connected');
    expect(dbBadge?.type).toBe('success');
  });

  it('should execute health check on backend card button click and update status', () => {
    component.checkHealth();
    expect(mockHealthService.getHealth).toHaveBeenCalled();
    expect(component.apiStatus()).toBe('Connected');
    expect(component.dbStatus()).toBe('Connected');
  });

  it('should emit cardAction output when custom card button is clicked', () => {
    const actionSpy = vi.fn();
    component.cardAction.subscribe(actionSpy);

    const customCard = {
      id: 'custom-card',
      title: 'Custom Action Card',
      footerButton: {
        label: 'Perform Action',
        action: 'custom-perform',
      },
    };

    component.onCardButtonClick(customCard);

    expect(actionSpy).toHaveBeenCalledWith({
      card: customCard,
      action: 'custom-perform',
    });
  });
});
