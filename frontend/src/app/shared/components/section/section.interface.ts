export interface SectionMediaConfig {
  image?: string;
  text?: string;
  alt?: string;
}

export interface SectionConfig {
  align?: 'left' | 'right';
  background?: string | null;
  parallax?: boolean;
  title?: string;
  description?: string;
  media?: SectionMediaConfig;
  // Flat convenience properties matching template usage
  mediaImage?: string;
  mediaText?: string;
}

export const DEFAULT_SECTION_CONFIG: SectionConfig = {
  align: 'left',
  title: 'El Dugout Ve - Béisbol Profesional Venezolano',
  description:
    'Enciclopedia y wiki dedicada a la Liga Venezolana de Béisbol Profesional (LVBP). Estadísticas, récords, franquicias y leyendas.',
  media: {
    image:
      'https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=1080&auto=format&fit=crop',
    text: 'El Dugout Ve - Plataforma LVBP',
    alt: 'Béisbol Profesional Venezolano',
  },
};
