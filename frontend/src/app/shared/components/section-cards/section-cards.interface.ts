export type BadgeType = 'success' | 'warning' | 'danger' | 'neutral';

export interface SectionCardBadge {
  text: string;
  type?: BadgeType;
}

export interface SectionCardButton {
  label: string;
  action?: string;
  disabled?: boolean;
}

export interface SectionCardItem {
  id?: string;
  title: string;
  description?: string;
  badge?: SectionCardBadge;
  footerCode?: string;
  footerButton?: SectionCardButton;
  footerText?: string;
}

export interface SectionCardsConfig {
  adminOnly?: boolean;
  indicatorText?: string;
  cards: SectionCardItem[];
}

export const DEFAULT_SECTION_CARDS_CONFIG: SectionCardsConfig = {
  adminOnly: true,
  indicatorText: 'Admin Access: System Health Matrix',
  cards: [
    {
      id: 'frontend',
      title: 'Frontend (Angular)',
      description: 'Standalone components, Angular Signals, and optimized Nginx container.',
      badge: {
        text: 'Online',
        type: 'success',
      },
      footerCode: 'Client Port: 4200 (Dev) / 8080 (Prod)',
    },
    {
      id: 'backend',
      title: 'Backend (NestJS)',
      description: 'Modular Clean Architecture with Terminus probes, Swagger, and validation.',
      badge: {
        text: 'Connected',
        type: 'success',
      },
      footerButton: {
        label: 'Check Health Probes ↻',
        action: 'refresh-health',
      },
    },
    {
      id: 'database',
      title: 'Database (PostgreSQL / Cloud SQL)',
      description: 'Prisma ORM with schema migrations, seed scripts, and Cloud SQL Auth socket ready.',
      badge: {
        text: 'Connected',
        type: 'success',
      },
      footerCode: 'Managed Engine: PostgreSQL 16',
    },
  ],
};
