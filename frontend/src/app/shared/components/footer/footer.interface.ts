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

export interface FooterBackgroundConfig {
  dark?: string;
  light?: string;
}

export interface FooterConfig {
  brand: FooterBrandConfig;
  sections?: FooterLinkSection[];
  contact?: FooterContactSection;
  newsletter?: FooterNewsletterConfig;
  social?: FooterSocialSection;
  bottom?: FooterBottomConfig;
  background?: FooterBackgroundConfig;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brand: {
    name: 'FOOTER.BRAND_NAME',
    slogan: 'FOOTER.BRAND_SLOGAN',
    aboutTitle: 'FOOTER.ABOUT_TITLE',
    aboutText: 'FOOTER.ABOUT_TEXT',
  },
  sections: [
    {
      title: 'FOOTER.CONTENT_TITLE',
      links: [
        { label: 'FOOTER.TEAMS', url: '/#teams' },
        { label: 'FOOTER.STATS', url: '/#stats' },
        { label: 'FOOTER.SEASONS', url: '/#seasons' },
        { label: 'FOOTER.HALL_OF_FAME', url: '/#hall-of-fame' },
      ],
    },
    {
      title: 'FOOTER.COMMUNITY_TITLE',
      links: [
        { label: 'FOOTER.ABOUT_US', url: '/about' },
        { label: 'FOOTER.SUBSCRIPTIONS', url: '/#subscription' },
        { label: 'FOOTER.TERMS', url: '/terms' },
        { label: 'FOOTER.CONTACT', url: '/contact' },
      ],
    },
  ],
  contact: {
    title: 'FOOTER.CONTACT',
    items: [
      { label: 'FOOTER.WEB_LABEL', value: 'eldugoutve.com', href: 'https://eldugoutve.com' },
      { label: 'FOOTER.EMAIL_LABEL', value: 'info@eldugoutve.com', href: 'mailto:info@eldugoutve.com' },
    ],
    showAccentBar: true,
  },
  newsletter: {
    placeholder: 'FOOTER.NEWSLETTER_PLACEHOLDER',
    buttonAriaLabel: 'FOOTER.NEWSLETTER_BTN_ARIA',
  },
  social: {
    title: 'FOOTER.FOLLOW_US',
    items: [
      { name: 'X / Twitter', symbol: 'X', url: 'https://x.com', highlighted: true },
      { name: 'Instagram', symbol: 'IG', url: 'https://instagram.com' },
      { name: 'YouTube', symbol: 'YT', url: 'https://youtube.com' },
      { name: 'Facebook', symbol: 'FB', url: 'https://facebook.com' },
    ],
  },
  bottom: {
    links: [
      { label: 'FOOTER.PRIVACY', url: '/privacy' },
      { label: 'FOOTER.TERMS_OF_SERVICE', url: '/terms' },
      { label: 'eldugoutve.com', url: 'https://eldugoutve.com', external: true },
    ],
    copyright: 'FOOTER.COPYRIGHT',
  },
};
