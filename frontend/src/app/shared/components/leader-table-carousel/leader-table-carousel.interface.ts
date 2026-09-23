export interface LeaderRowItem {
  yearOrSpan: string;
  player: string;
  team: string;
  statValue: string | number;
  rank?: number;
  slug?: string;
}

export interface LeaderTableCard {
  id: string;
  categoryKey: string;
  categoryTitle: string;
  icon?: string;
  statColumn: string;
  badgeText?: string;
  fullHistoryUrl?: string;
  items: LeaderRowItem[];
}

export interface LeaderCarouselConfig {
  id?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  tables: LeaderTableCard[];
  loop?: boolean;
  fullHistoryUrl?: string;
}

export const DEFAULT_BATTING_RECORDS_CONFIG: LeaderCarouselConfig = {
  id: 'batting-records',
  badge: 'LEADERS_CAROUSEL.ESTADISTICAS_BADGE',
  title: 'LEADERS_CAROUSEL.BATTING_TITLE',
  subtitle: 'LEADERS_CAROUSEL.BATTING_SUBTITLE',
  loop: true,
  fullHistoryUrl: '/stats',
  tables: [
    {
      id: 'home-runs',
      categoryKey: 'LEADERS_CAROUSEL.HOME_RUNS_TITLE',
      categoryTitle: 'Líderes en Jonrones',
      icon: '⚾',
      statColumn: 'HR',
      badgeText: 'LEADERS_CAROUSEL.TOP_5_BADGE',
      fullHistoryUrl: '/stats/home-runs',
      items: [
        { yearOrSpan: '1997-18', player: 'Eliezer Alfonzo', team: 'Caribes / Magallanes', statValue: 138, rank: 1 },
        { yearOrSpan: '1994-17', player: 'Alex Cabrera', team: 'Pastora / Tiburones', statValue: 135, rank: 2 },
        { yearOrSpan: '1988-15', player: 'Robert Pérez', team: 'Cardenales de Lara', statValue: 125, rank: 3 },
        { yearOrSpan: '1972-91', player: 'Antonio Armas', team: 'Leones del Caracas', statValue: 97, rank: 4 },
        { yearOrSpan: '1999-19', player: 'José Castillo', team: 'Caracas / Lara', statValue: 90, rank: 5 },
      ],
    },
    {
      id: 'hits',
      categoryKey: 'LEADERS_CAROUSEL.HITS_TITLE',
      categoryTitle: 'Líderes en Hits (Imparables)',
      icon: '🔥',
      statColumn: 'H',
      badgeText: 'LEADERS_CAROUSEL.TOP_5_BADGE',
      fullHistoryUrl: '/stats/hits',
      items: [
        { yearOrSpan: '1957-87', player: 'Víctor Davalillo', team: 'Caracas / Tigres', statValue: '1,505', rank: 1 },
        { yearOrSpan: '1988-15', player: 'Robert Pérez', team: 'Cardenales de Lara', statValue: '1,369', rank: 2 },
        { yearOrSpan: '1956-79', player: 'Teolindo Acosta', team: 'Lara / Magallanes', statValue: '1,289', rank: 3 },
        { yearOrSpan: '1959-86', player: 'César Tovar', team: 'Caracas / Zulia', statValue: '1,224', rank: 4 },
        { yearOrSpan: '1949-69', player: 'Luis García', team: 'Magallanes / Oriente', statValue: '1,065', rank: 5 },
      ],
    },
    {
      id: 'batting-average',
      categoryKey: 'LEADERS_CAROUSEL.BATTING_AVG_TITLE',
      categoryTitle: 'Campeones de Bateo',
      icon: '⚾',
      statColumn: 'AVG',
      badgeText: 'LEADERS_CAROUSEL.RECENT_SEASONS_BADGE',
      fullHistoryUrl: '/stats/batting-average',
      items: [
        { yearOrSpan: '25-26', player: 'Lorenzo Cedrola', team: 'Tigres de Aragua', statValue: '.395', rank: 1 },
        { yearOrSpan: '24-25', player: 'Gorkys Hernández', team: 'Cardenales de Lara', statValue: '.374', rank: 2 },
        { yearOrSpan: '23-24', player: 'Gabriel Noriega', team: 'Leones del Caracas', statValue: '.376', rank: 3 },
        { yearOrSpan: '22-23', player: 'Freddy Fermín', team: 'Leones del Caracas', statValue: '.404', rank: 4 },
        { yearOrSpan: '21-22', player: 'Ramón Flores', team: 'Bravos de Margarita', statValue: '.416', rank: 5 },
      ],
    },
    {
      id: 'stolen-bases',
      categoryKey: 'LEADERS_CAROUSEL.STOLEN_BASES_TITLE',
      categoryTitle: 'Líderes en Bases Robadas',
      icon: '⚡',
      statColumn: 'BR',
      badgeText: 'LEADERS_CAROUSEL.TOP_5_BADGE',
      fullHistoryUrl: '/stats/stolen-bases',
      items: [
        { yearOrSpan: '1979-94', player: 'José Leiva', team: 'Leones del Caracas', statValue: 152, rank: 1 },
        { yearOrSpan: '1977-93', player: 'Leonardo Hernández', team: 'Caracas / Zulia', statValue: 145, rank: 2 },
        { yearOrSpan: '1957-87', player: 'Víctor Davalillo', team: 'Caracas / Tigres', statValue: 137, rank: 3 },
        { yearOrSpan: '1959-78', player: 'Gustavo Gil', team: 'Magallanes / Lara', statValue: 129, rank: 4 },
        { yearOrSpan: '1993-07', player: 'Roger Cedeño', team: 'Leones del Caracas', statValue: 125, rank: 5 },
      ],
    },
  ],
};

export const DEFAULT_PITCHING_RECORDS_CONFIG: LeaderCarouselConfig = {
  id: 'pitching-records',
  badge: 'LEADERS_CAROUSEL.ESTADISTICAS_BADGE',
  title: 'LEADERS_CAROUSEL.PITCHING_TITLE',
  subtitle: 'LEADERS_CAROUSEL.PITCHING_SUBTITLE',
  loop: true,
  fullHistoryUrl: '/stats',
  tables: [
    {
      id: 'wins',
      categoryKey: 'LEADERS_CAROUSEL.WINS_TITLE',
      categoryTitle: 'Líderes en Victorias (Juegos Ganados)',
      icon: '🏆',
      statColumn: 'JG',
      badgeText: 'LEADERS_CAROUSEL.TOP_5_BADGE',
      fullHistoryUrl: '/stats/wins',
      items: [
        { yearOrSpan: '1948-73', player: 'José Bracho', team: 'Caracas / Magallanes', statValue: 109, rank: 1 },
        { yearOrSpan: '1950-65', player: 'Emilio Cueche', team: 'Caracas / Magallanes', statValue: 87, rank: 2 },
        { yearOrSpan: '1960-83', player: 'Luis Peñalver', team: 'Caracas / Águilas', statValue: 84, rank: 3 },
        { yearOrSpan: '1952-70', player: 'Carrao Bracho', team: 'Zulia / Pastora', statValue: 82, rank: 4 },
        { yearOrSpan: '1990-11', player: 'Giovanni Carrara', team: 'Cardenales de Lara', statValue: 67, rank: 5 },
      ],
    },
    {
      id: 'strikeouts',
      categoryKey: 'LEADERS_CAROUSEL.STRIKEOUTS_TITLE',
      categoryTitle: 'Líderes en Ponches',
      icon: '🔥',
      statColumn: 'SO',
      badgeText: 'LEADERS_CAROUSEL.TOP_5_BADGE',
      fullHistoryUrl: '/stats/strikeouts',
      items: [
        { yearOrSpan: '1948-73', player: 'José Bracho', team: 'Caracas / Magallanes', statValue: 850, rank: 1 },
        { yearOrSpan: '1960-83', player: 'Luis Peñalver', team: 'Caracas / Águilas', statValue: 748, rank: 2 },
        { yearOrSpan: '1990-11', player: 'Giovanni Carrara', team: 'Cardenales de Lara', statValue: 634, rank: 3 },
        { yearOrSpan: '1968-83', player: 'Roberto Muñoz', team: 'Magallanes / Tigres', statValue: 581, rank: 4 },
        { yearOrSpan: '1962-79', player: 'Diego Seguí', team: 'Caracas / La Guaira', statValue: 578, rank: 5 },
      ],
    },
    {
      id: 'saves',
      categoryKey: 'LEADERS_CAROUSEL.SAVES_TITLE',
      categoryTitle: 'Líderes en Salvados (Juegos Salvados)',
      icon: '⚾',
      statColumn: 'JS',
      badgeText: 'LEADERS_CAROUSEL.TOP_5_BADGE',
      fullHistoryUrl: '/stats/saves',
      items: [
        { yearOrSpan: '1989-08', player: 'Richard Garcés', team: 'Tigres / Magallanes', statValue: 124, rank: 1 },
        { yearOrSpan: '1999-19', player: 'Francisco Buttó', team: 'Tigres / Caribes', statValue: 88, rank: 2 },
        { yearOrSpan: '2013-18', player: 'Hassan Pena', team: 'Magallanes / Tiburones', statValue: 86, rank: 3 },
        { yearOrSpan: '1997-12', player: 'Jorge Julio Tapia', team: 'Caracas / Tiburones', statValue: 69, rank: 4 },
        { yearOrSpan: '2004-24', player: 'Jean Machí', team: 'Magallanes / Tigres', statValue: 62, rank: 5 },
      ],
    },
  ],
};
