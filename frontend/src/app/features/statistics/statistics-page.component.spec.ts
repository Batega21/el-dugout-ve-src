// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { StatisticsPageComponent } from './statistics-page.component';
import { StatisticsService } from '../../core/services/statistics.service';
import { BattingPlayerStat, PitchingPlayerStat } from '../../core/models/statistics.model';

describe('StatisticsPageComponent', () => {
  let component: StatisticsPageComponent;
  let injector: Injector;

  const mockBattingPlayers: BattingPlayerStat[] = [
    { id: 'b-1', rank: 1, player: 'Eliezer Alfonzo', seasons: '1997-2018', startYear: 1997, endYear: 2018, teams: ['Caribes', 'Magallanes'], games: 808, atBats: 2841, homeRuns: 138, hits: 785, avg: '.276', avgValue: 0.276, stolenBases: 1, value: 138, formattedValue: '138' },
    { id: 'b-2', rank: 2, player: 'Alex Cabrera', seasons: '1994-2017', startYear: 1994, endYear: 2017, teams: ['Pastora', 'Tiburones'], games: 664, atBats: 2337, homeRuns: 135, hits: 706, avg: '.302', avgValue: 0.302, stolenBases: 22, value: 135, formattedValue: '135' },
    { id: 'b-3', rank: 3, player: 'Robert Pérez', seasons: '1988-2015', startYear: 1988, endYear: 2015, teams: ['Lara'], games: 1300, atBats: 4859, homeRuns: 125, hits: 1369, avg: '.282', avgValue: 0.282, stolenBases: 77, value: 125, formattedValue: '125' },
    { id: 'b-4', rank: 4, player: 'Antonio Armas', seasons: '1972-1991', startYear: 1972, endYear: 1991, teams: ['Caracas'], games: 787, atBats: 2831, homeRuns: 97, hits: 713, avg: '.252', avgValue: 0.252, stolenBases: 32, value: 97, formattedValue: '97' },
    { id: 'b-5', rank: 5, player: 'Luis Raven', seasons: '1991-2007', startYear: 1991, endYear: 2007, teams: ['Magallanes'], games: 660, atBats: 2381, homeRuns: 94, hits: 676, avg: '.284', avgValue: 0.284, stolenBases: 12, value: 94, formattedValue: '94' },
    { id: 'b-6', rank: 6, player: 'Oscar Salazar', seasons: '1997-2017', startYear: 1997, endYear: 2017, teams: ['La Guaira'], games: 873, atBats: 3108, homeRuns: 94, hits: 864, avg: '.278', avgValue: 0.278, stolenBases: 26, value: 94, formattedValue: '94' },
    { id: 'b-7', rank: 7, player: 'José Castillo', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Caracas'], games: 973, atBats: 3411, homeRuns: 90, hits: 1032, avg: '.303', avgValue: 0.303, stolenBases: 61, value: 90, formattedValue: '90' },
    { id: 'b-8', rank: 8, player: 'René Reyes', seasons: '1998-2022', startYear: 1998, endYear: 2022, teams: ['Margarita'], games: 1042, atBats: 3698, homeRuns: 83, hits: 1048, avg: '.283', avgValue: 0.283, stolenBases: 68, value: 83, formattedValue: '83' },
    { id: 'b-9', rank: 9, player: 'Héctor Giménez', seasons: '2000-2019', startYear: 2000, endYear: 2019, teams: ['Tigres'], games: 742, atBats: 2548, homeRuns: 82, hits: 718, avg: '.282', avgValue: 0.282, stolenBases: 14, value: 82, formattedValue: '82' },
    { id: 'b-10', rank: 10, player: 'Balbino Fuenmayor', seasons: '2010-2026', startYear: 2010, endYear: 2026, teams: ['Caribes'], games: 546, atBats: 1982, homeRuns: 73, hits: 598, avg: '.302', avgValue: 0.302, stolenBases: 5, value: 73, formattedValue: '73' },
    { id: 'b-11', rank: 11, player: 'Leonardo Hernández', seasons: '1977-1993', startYear: 1977, endYear: 1993, teams: ['Caracas'], games: 739, atBats: 2608, homeRuns: 72, hits: 712, avg: '.273', avgValue: 0.273, stolenBases: 145, value: 72, formattedValue: '72' },
    { id: 'b-12', rank: 12, player: 'Roberto Zambrano', seasons: '1988-2005', startYear: 1988, endYear: 2005, teams: ['Tigres'], games: 631, atBats: 2190, homeRuns: 70, hits: 609, avg: '.278', avgValue: 0.278, stolenBases: 34, value: 70, formattedValue: '70' },
  ];

  const mockPitchingPlayers: PitchingPlayerStat[] = [
    { id: 'p-1', rank: 1, player: 'José Bracho', seasons: '1948-1973', startYear: 1948, endYear: 1973, teams: ['Caracas', 'Magallanes'], inningsPitched: '1,769.2', ipValue: 1769.2, era: '3.17', eraValue: 3.17, wins: 109, strikeouts: 850, saves: 16, value: 109, formattedValue: '109' },
    { id: 'p-2', rank: 2, player: 'Emilio Cueche', seasons: '1950-1965', startYear: 1950, endYear: 1965, teams: ['Caracas'], inningsPitched: '1,421.0', ipValue: 1421.0, era: '3.08', eraValue: 3.08, wins: 87, strikeouts: 531, saves: 12, value: 87, formattedValue: '87' },
    { id: 'p-3', rank: 3, player: 'Luis Peñalver', seasons: '1960-1983', startYear: 1960, endYear: 1983, teams: ['Caracas'], inningsPitched: '1,514.1', ipValue: 1514.1, era: '3.07', eraValue: 3.07, wins: 84, strikeouts: 748, saves: 19, value: 84, formattedValue: '84' },
    { id: 'p-4', rank: 4, player: 'Carrao Bracho', seasons: '1952-1970', startYear: 1952, endYear: 1970, teams: ['Zulia'], inningsPitched: '1,310.2', ipValue: 1310.2, era: '3.19', eraValue: 3.19, wins: 82, strikeouts: 560, saves: 14, value: 82, formattedValue: '82' },
    { id: 'p-5', rank: 5, player: 'Giovanni Carrara', seasons: '1990-2011', startYear: 1990, endYear: 2011, teams: ['Lara'], inningsPitched: '1,012.0', ipValue: 1012.0, era: '2.93', eraValue: 2.93, wins: 67, strikeouts: 634, saves: 56, value: 67, formattedValue: '67' },
    { id: 'p-6', rank: 6, player: 'Diego Seguí', seasons: '1962-1979', startYear: 1962, endYear: 1979, teams: ['La Guaira'], inningsPitched: '1,178.0', ipValue: 1178.0, era: '2.76', eraValue: 2.76, wins: 64, strikeouts: 578, saves: 21, value: 64, formattedValue: '64' },
    { id: 'p-7', rank: 7, player: 'Roberto Muñoz', seasons: '1968-1983', startYear: 1968, endYear: 1983, teams: ['Magallanes'], inningsPitched: '1,098.2', ipValue: 1098.2, era: '2.92', eraValue: 2.92, wins: 64, strikeouts: 581, saves: 51, value: 64, formattedValue: '64' },
    { id: 'p-8', rank: 8, player: 'Aurelio Monteagudo', seasons: '1963-1982', startYear: 1963, endYear: 1982, teams: ['Caracas'], inningsPitched: '1,108.1', ipValue: 1108.1, era: '3.12', eraValue: 3.12, wins: 63, strikeouts: 535, saves: 31, value: 63, formattedValue: '63' },
    { id: 'p-9', rank: 9, player: 'Urbano Lugo Sr.', seasons: '1963-1975', startYear: 1963, endYear: 1975, teams: ['La Guaira'], inningsPitched: '912.1', ipValue: 912.1, era: '2.75', eraValue: 2.75, wins: 52, strikeouts: 412, saves: 18, value: 52, formattedValue: '52' },
    { id: 'p-10', rank: 10, player: 'Urbano Lugo Jr.', seasons: '1981-1998', startYear: 1981, endYear: 1998, teams: ['Caracas'], inningsPitched: '984.0', ipValue: 984.0, era: '3.38', eraValue: 3.38, wins: 52, strikeouts: 507, saves: 11, value: 52, formattedValue: '52' },
    { id: 'p-11', rank: 11, player: 'Horacio Estrada', seasons: '1995-2012', startYear: 1995, endYear: 2012, teams: ['Tigres'], inningsPitched: '852.1', ipValue: 852.1, era: '3.62', eraValue: 3.62, wins: 50, strikeouts: 421, saves: 8, value: 50, formattedValue: '50' },
  ];

  let mockStatisticsService: {
    getBattingLeaders: any;
    getPitchingLeaders: any;
  };

  beforeEach(() => {
    mockStatisticsService = {
      getBattingLeaders: vi.fn().mockReturnValue(of(mockBattingPlayers)),
      getPitchingLeaders: vi.fn().mockReturnValue(of(mockPitchingPlayers)),
    };

    injector = Injector.create({
      providers: [
        { provide: StatisticsService, useValue: mockStatisticsService },
      ],
    });

    component = runInInjectionContext(injector, () => new StatisticsPageComponent());
  });

  it('should create the StatisticsPageComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State & Default Categories', () => {
    it('should initialize with Home Runs (HR) and Wins (W) pre-selected', () => {
      expect(component.selectedBattingCategory()).toBe('HR');
      expect(component.selectedPitchingCategory()).toBe('W');
    });

    it('should initialize with default pagination page 1 and page size 10', () => {
      expect(component.battingPage()).toBe(1);
      expect(component.battingPageSize()).toBe(10);
      expect(component.pitchingPage()).toBe(1);
      expect(component.pitchingPageSize()).toBe(10);
    });

    it('should initialize sort column to "value" and direction to "desc"', () => {
      expect(component.battingSortColumn()).toBe('value');
      expect(component.battingSortDirection()).toBe('desc');
      expect(component.pitchingSortColumn()).toBe('value');
      expect(component.pitchingSortDirection()).toBe('desc');
    });

    it('should load initial batting and pitching data on ngOnInit', () => {
      component.ngOnInit();
      expect(mockStatisticsService.getBattingLeaders).toHaveBeenCalledWith('HR');
      expect(mockStatisticsService.getPitchingLeaders).toHaveBeenCalledWith('W');
      expect(component.allBattingPlayers().length).toBe(12);
      expect(component.allPitchingPlayers().length).toBe(11);
    });
  });

  describe('Batting Category Tabs & Loading State', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should switch batting category and fetch data for Hits (H)', () => {
      component.setBattingCategory('H');
      expect(component.selectedBattingCategory()).toBe('H');
      expect(mockStatisticsService.getBattingLeaders).toHaveBeenCalledWith('H');
      expect(component.battingPage()).toBe(1);
    });

    it('should switch batting category and fetch data for Batting Champions (AVG)', () => {
      component.setBattingCategory('AVG');
      expect(component.selectedBattingCategory()).toBe('AVG');
      expect(mockStatisticsService.getBattingLeaders).toHaveBeenCalledWith('AVG');
    });

    it('should switch batting category and fetch data for Stolen Bases (SB)', () => {
      component.setBattingCategory('SB');
      expect(component.selectedBattingCategory()).toBe('SB');
      expect(mockStatisticsService.getBattingLeaders).toHaveBeenCalledWith('SB');
    });

    it('should not trigger refetch if clicking already active category', () => {
      mockStatisticsService.getBattingLeaders.mockClear();
      component.setBattingCategory('HR');
      expect(mockStatisticsService.getBattingLeaders).not.toHaveBeenCalled();
    });
  });

  describe('Pitching Category Tabs & Loading State', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should switch pitching category to Strikeouts (SO)', () => {
      component.setPitchingCategory('SO');
      expect(component.selectedPitchingCategory()).toBe('SO');
      expect(mockStatisticsService.getPitchingLeaders).toHaveBeenCalledWith('SO');
      expect(component.pitchingPage()).toBe(1);
    });

    it('should switch pitching category to Saves (SV)', () => {
      component.setPitchingCategory('SV');
      expect(component.selectedPitchingCategory()).toBe('SV');
      expect(mockStatisticsService.getPitchingLeaders).toHaveBeenCalledWith('SV');
    });

    it('should not trigger refetch if clicking already active category', () => {
      mockStatisticsService.getPitchingLeaders.mockClear();
      component.setPitchingCategory('W');
      expect(mockStatisticsService.getPitchingLeaders).not.toHaveBeenCalled();
    });
  });

  describe('Sorting Behavior', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should toggle sort direction when clicking the active sort column', () => {
      expect(component.battingSortColumn()).toBe('value');
      expect(component.battingSortDirection()).toBe('desc');

      component.toggleBattingSort('value');
      expect(component.battingSortDirection()).toBe('asc');

      component.toggleBattingSort('value');
      expect(component.battingSortDirection()).toBe('desc');
    });

    it('should sort alphabetically by Player Name', () => {
      component.toggleBattingSort('player');
      expect(component.battingSortColumn()).toBe('player');
      expect(component.battingSortDirection()).toBe('asc');

      const sorted = component.sortedBattingPlayers();
      expect(sorted[0].player).toBe('Alex Cabrera');
    });

    it('should sort chronologically by Seasons', () => {
      component.toggleBattingSort('seasons');
      expect(component.battingSortColumn()).toBe('seasons');
      expect(component.battingSortDirection()).toBe('asc');

      const sorted = component.sortedBattingPlayers();
      expect(sorted[0].player).toBe('Antonio Armas'); // 1972 startYear
    });

    it('should sort pitching by Pitcher Name', () => {
      component.togglePitchingSort('player');
      expect(component.pitchingSortColumn()).toBe('player');
      expect(component.pitchingSortDirection()).toBe('asc');

      const sorted = component.sortedPitchingPlayers();
      expect(sorted[0].player).toBe('Aurelio Monteagudo');
    });
  });

  describe('Pagination & Page Size Controls', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should slice exactly 10 players for page 1 with page size 10', () => {
      expect(component.paginatedBattingPlayers().length).toBe(10);
      expect(component.battingTotalPages()).toBe(2);
      expect(component.battingStartIndex()).toBe(1);
      expect(component.battingEndIndex()).toBe(10);
    });

    it('should navigate to next page and slice remaining players', () => {
      component.nextBattingPage();
      expect(component.battingPage()).toBe(2);
      expect(component.paginatedBattingPlayers().length).toBe(2);
      expect(component.battingStartIndex()).toBe(11);
      expect(component.battingEndIndex()).toBe(12);
    });

    it('should navigate back to previous page', () => {
      component.nextBattingPage();
      expect(component.battingPage()).toBe(2);

      component.prevBattingPage();
      expect(component.battingPage()).toBe(1);
    });

    it('should not go below page 1 on prevBattingPage', () => {
      expect(component.battingPage()).toBe(1);
      component.prevBattingPage();
      expect(component.battingPage()).toBe(1);
    });

    it('should not go beyond last page on nextBattingPage', () => {
      component.nextBattingPage(); // page 2
      expect(component.battingPage()).toBe(2);
      component.nextBattingPage(); // stays at page 2
      expect(component.battingPage()).toBe(2);
    });

    it('should adjust pagination when changing page size to 20 or 50', () => {
      component.setBattingPageSize(20);
      expect(component.battingPageSize()).toBe(20);
      expect(component.battingPage()).toBe(1);
      expect(component.battingTotalPages()).toBe(1);
      expect(component.paginatedBattingPlayers().length).toBe(12);

      component.setBattingPageSize(50);
      expect(component.battingPageSize()).toBe(50);
      expect(component.paginatedBattingPlayers().length).toBe(12);
    });

    it('should handle pitching pagination correctly', () => {
      expect(component.paginatedPitchingPlayers().length).toBe(10);
      expect(component.pitchingTotalPages()).toBe(2);

      component.nextPitchingPage();
      expect(component.pitchingPage()).toBe(2);
      expect(component.paginatedPitchingPlayers().length).toBe(1);

      component.prevPitchingPage();
      expect(component.pitchingPage()).toBe(1);

      component.setPitchingPageSize(20);
      expect(component.paginatedPitchingPlayers().length).toBe(11);
      expect(component.pitchingTotalPages()).toBe(1);
    });
  });

  describe('Team Badges Styling', () => {
    it('should return appropriate badge class for teams', () => {
      expect(component.getTeamBadgeClass('Leones del Caracas')).toBe('badge-team-caracas');
      expect(component.getTeamBadgeClass('Navegantes del Magallanes')).toBe('badge-team-magallanes');
      expect(component.getTeamBadgeClass('Tiburones de La Guaira')).toBe('badge-team-tiburones');
      expect(component.getTeamBadgeClass('Tigres de Aragua')).toBe('badge-team-tigres');
      expect(component.getTeamBadgeClass('Cardenales de Lara')).toBe('badge-team-cardenales');
      expect(component.getTeamBadgeClass('Águilas del Zulia')).toBe('badge-team-aguilas');
      expect(component.getTeamBadgeClass('Caribes de Anzoátegui')).toBe('badge-team-caribes');
      expect(component.getTeamBadgeClass('Bravos de Margarita')).toBe('badge-team-bravos');
      expect(component.getTeamBadgeClass('Pastora de Occidente')).toBe('badge-team-pastora');
      expect(component.getTeamBadgeClass('Other Team')).toBe('badge-team-default');
    });
  });
});
