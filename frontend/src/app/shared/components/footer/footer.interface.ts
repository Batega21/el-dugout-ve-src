export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface FooterLinkSection {
  title: string;
  links: FooterLink[];
}

export interface FooterContactItem {
  label: string;
  value: string;
  href?: string;
}

export interface FooterContactSection {
  title: string;
  items: FooterContactItem[];
  showAccentBar?: boolean;
}

export interface FooterSocialItem {
  name: string;
  symbol: string;
  icon?: string;
  url: string;
  highlighted?: boolean;
}

export interface FooterSocialSection {
  title?: string;
  items: FooterSocialItem[];
}

export interface FooterNewsletterConfig {
  placeholder?: string;
  buttonAriaLabel?: string;
}

export interface FooterBottomConfig {
  links: FooterLink[];
  copyright: string;
}

export interface FooterBrandConfig {
  name: string;
  slogan?: string;
  aboutTitle?: string;
  aboutText?: string;
}

export interface FooterConfig {
  brand: FooterBrandConfig;
  sections?: FooterLinkSection[];
  contact?: FooterContactSection;
  newsletter?: FooterNewsletterConfig;
  social?: FooterSocialSection;
  bottom?: FooterBottomConfig;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brand: {
    name: 'EL DUGOUT VE',
    slogan: 'La Wiki del Béisbol Profesional Venezolano',
    aboutTitle: 'Sobre El Dugout Ve',
    aboutText:
      'Enciclopedia y plataforma dedicada a preservar la historia, estadísticas, franquicias, temporadas y leyendas de la Liga Venezolana de Béisbol Profesional (LVBP).',
  },
  sections: [
    {
      title: 'Contenido',
      links: [
        { label: 'Equipos LVBP', url: '/#teams' },
        { label: 'Estadísticas', url: '/#stats' },
        { label: 'Temporadas', url: '/#seasons' },
        { label: 'Salón de la Fama', url: '/#hall-of-fame' },
      ],
    },
    {
      title: 'Comunidad',
      links: [
        { label: 'Sobre Nosotros', url: '/about' },
        { label: 'Suscripciones', url: '/#subscription' },
        { label: 'Términos y Condiciones', url: '/terms' },
        { label: 'Contacto', url: '/contact' },
      ],
    },
  ],
  contact: {
    title: 'Contacto',
    items: [
      { label: 'Web:', value: 'eldugoutve.com', href: 'https://eldugoutve.com' },
      { label: 'Email:', value: 'contacto@eldugoutve.com', href: 'mailto:contacto@eldugoutve.com' },
    ],
    showAccentBar: true,
  },
  newsletter: {
    placeholder: 'Tu correo electrónico',
    buttonAriaLabel: 'Suscribirse al boletín',
  },
  social: {
    title: 'Síguenos',
    items: [
      { name: 'X / Twitter', symbol: 'X', url: 'https://x.com', highlighted: true },
      { name: 'Instagram', symbol: 'IG', url: 'https://instagram.com' },
      { name: 'YouTube', symbol: 'YT', url: 'https://youtube.com' },
      { name: 'Facebook', symbol: 'FB', url: 'https://facebook.com' },
    ],
  },
  bottom: {
    links: [
      { label: 'Política de Privacidad', url: '/privacy' },
      { label: 'Términos de Servicio', url: '/terms' },
      { label: 'eldugoutve.com', url: 'https://eldugoutve.com', external: true },
    ],
    copyright: '© 2026 El Dugout Ve (eldugoutve.com). Todos los derechos reservados.',
  },
};
