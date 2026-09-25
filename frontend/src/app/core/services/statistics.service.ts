import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  BattingCategory,
  BattingPlayerStat,
  PitchingCategory,
  PitchingPlayerStat,
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  /**
   * Retrieves all-time batting leaders for the requested statistical category.
   * Emits with an intentional brief delay (200ms) to ensure smooth skeleton loader transitions.
   */
  getBattingLeaders(category: BattingCategory): Observable<BattingPlayerStat[]> {
    const rawData = this.getRawBattingData(category);
    return of(rawData).pipe(delay(200));
  }

  /**
   * Retrieves all-time pitching leaders for the requested statistical category.
   * Emits with an intentional brief delay (200ms) to ensure smooth skeleton loader transitions.
   */
  getPitchingLeaders(category: PitchingCategory): Observable<PitchingPlayerStat[]> {
    const rawData = this.getRawPitchingData(category);
    return of(rawData).pipe(delay(200));
  }

  // ---------------------------------------------------------------------------
  // RAW BATTING DATASETS (Authentic historical LVBP records)
  // ---------------------------------------------------------------------------

  private getRawBattingData(category: BattingCategory): BattingPlayerStat[] {
    switch (category) {
      case 'HR':
        return [
          { id: 'b-hr-1', rank: 1, player: 'Eliezer Alfonzo', seasons: '1997-2018', startYear: 1997, endYear: 2018, teams: ['Caribes', 'Magallanes'], games: 808, atBats: 2841, homeRuns: 138, hits: 785, avg: '.276', avgValue: 0.276, stolenBases: 1, value: 138, formattedValue: '138' },
          { id: 'b-hr-2', rank: 2, player: 'Alex Cabrera', seasons: '1994-2017', startYear: 1994, endYear: 2017, teams: ['Pastora', 'Tiburones', 'Tigres'], games: 664, atBats: 2337, homeRuns: 135, hits: 706, avg: '.302', avgValue: 0.302, stolenBases: 22, value: 135, formattedValue: '135' },
          { id: 'b-hr-3', rank: 3, player: 'Robert Pérez', seasons: '1988-2015', startYear: 1988, endYear: 2015, teams: ['Lara'], games: 1300, atBats: 4859, homeRuns: 125, hits: 1369, avg: '.282', avgValue: 0.282, stolenBases: 77, value: 125, formattedValue: '125' },
          { id: 'b-hr-4', rank: 4, player: 'Antonio Armas', seasons: '1972-1991', startYear: 1972, endYear: 1991, teams: ['Caracas', 'Caribes'], games: 787, atBats: 2831, homeRuns: 97, hits: 713, avg: '.252', avgValue: 0.252, stolenBases: 32, value: 97, formattedValue: '97' },
          { id: 'b-hr-5', rank: 5, player: 'Luis Raven', seasons: '1991-2007', startYear: 1991, endYear: 2007, teams: ['Magallanes', 'Pastora', 'La Guaira'], games: 660, atBats: 2381, homeRuns: 94, hits: 676, avg: '.284', avgValue: 0.284, stolenBases: 12, value: 94, formattedValue: '94' },
          { id: 'b-hr-6', rank: 6, player: 'Oscar Salazar', seasons: '1997-2017', startYear: 1997, endYear: 2017, teams: ['Pastora', 'La Guaira', 'Caribes'], games: 873, atBats: 3108, homeRuns: 94, hits: 864, avg: '.278', avgValue: 0.278, stolenBases: 26, value: 94, formattedValue: '94' },
          { id: 'b-hr-7', rank: 7, player: 'José Castillo', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Caracas', 'Lara', 'Tiburones'], games: 973, atBats: 3411, homeRuns: 90, hits: 1032, avg: '.303', avgValue: 0.303, stolenBases: 61, value: 90, formattedValue: '90' },
          { id: 'b-hr-8', rank: 8, player: 'René Reyes', seasons: '1998-2022', startYear: 1998, endYear: 2022, teams: ['Caracas', 'Lara', 'Margarita', 'Caribes'], games: 1042, atBats: 3698, homeRuns: 83, hits: 1048, avg: '.283', avgValue: 0.283, stolenBases: 68, value: 83, formattedValue: '83' },
          { id: 'b-hr-9', rank: 9, player: 'Héctor Giménez', seasons: '2000-2019', startYear: 2000, endYear: 2019, teams: ['Magallanes', 'Tigres', 'Águilas'], games: 742, atBats: 2548, homeRuns: 82, hits: 718, avg: '.282', avgValue: 0.282, stolenBases: 14, value: 82, formattedValue: '82' },
          { id: 'b-hr-10', rank: 10, player: 'Balbino Fuenmayor', seasons: '2010-2026', startYear: 2010, endYear: 2026, teams: ['Caribes'], games: 546, atBats: 1982, homeRuns: 73, hits: 598, avg: '.302', avgValue: 0.302, stolenBases: 5, value: 73, formattedValue: '73' },
          { id: 'b-hr-11', rank: 11, player: 'Leonardo Hernández', seasons: '1977-1993', startYear: 1977, endYear: 1993, teams: ['Caracas', 'Zulia', 'Tigres'], games: 739, atBats: 2608, homeRuns: 72, hits: 712, avg: '.273', avgValue: 0.273, stolenBases: 145, value: 72, formattedValue: '72' },
          { id: 'b-hr-12', rank: 12, player: 'Roberto Zambrano', seasons: '1988-2005', startYear: 1988, endYear: 2005, teams: ['Magallanes', 'Tigres', 'Pastora'], games: 631, atBats: 2190, homeRuns: 70, hits: 609, avg: '.278', avgValue: 0.278, stolenBases: 34, value: 70, formattedValue: '70' },
          { id: 'b-hr-13', rank: 13, player: 'Luis Landaeta', seasons: '1995-2011', startYear: 1995, endYear: 2011, teams: ['Pastora', 'Caracas', 'Tiburones'], games: 610, atBats: 2045, homeRuns: 68, hits: 574, avg: '.281', avgValue: 0.281, stolenBases: 18, value: 68, formattedValue: '68' },
          { id: 'b-hr-14', rank: 14, player: 'Frank Díaz', seasons: '2001-2022', startYear: 2001, endYear: 2022, teams: ['Magallanes', 'Bravos'], games: 835, atBats: 2884, homeRuns: 67, hits: 812, avg: '.282', avgValue: 0.282, stolenBases: 41, value: 67, formattedValue: '67' },
          { id: 'b-hr-15', rank: 15, player: 'Luis Jiménez', seasons: '2001-2020', startYear: 2001, endYear: 2020, teams: ['Lara', 'Caribes', 'Águilas'], games: 705, atBats: 2269, homeRuns: 66, hits: 678, avg: '.299', avgValue: 0.299, stolenBases: 11, value: 66, formattedValue: '66' },
          { id: 'b-hr-16', rank: 16, player: 'Baudilio Díaz', seasons: '1972-1990', startYear: 1972, endYear: 1990, teams: ['Caracas'], games: 576, atBats: 2056, homeRuns: 57, hits: 582, avg: '.283', avgValue: 0.283, stolenBases: 7, value: 57, formattedValue: '57' },
          { id: 'b-hr-17', rank: 17, player: 'Ernesto Mejía', seasons: '2007-2015', startYear: 2007, endYear: 2015, teams: ['Águilas'], games: 334, atBats: 1215, homeRuns: 57, hits: 373, avg: '.307', avgValue: 0.307, stolenBases: 6, value: 57, formattedValue: '57' },
          { id: 'b-hr-18', rank: 18, player: 'Richard Hidalgo', seasons: '1991-2012', startYear: 1991, endYear: 2012, teams: ['Magallanes'], games: 521, atBats: 1779, homeRuns: 56, hits: 504, avg: '.283', avgValue: 0.283, stolenBases: 25, value: 56, formattedValue: '56' },
          { id: 'b-hr-19', rank: 19, player: 'Gonzalo Márquez', seasons: '1965-1984', startYear: 1965, endYear: 1984, teams: ['Caracas', 'Magallanes'], games: 820, atBats: 2840, homeRuns: 54, hits: 812, avg: '.286', avgValue: 0.286, stolenBases: 39, value: 54, formattedValue: '54' },
          { id: 'b-hr-20', rank: 20, player: 'Jesús Guzmán', seasons: '2004-2023', startYear: 2004, endYear: 2023, teams: ['Lara', 'Caracas', 'Tigres'], games: 642, atBats: 2198, homeRuns: 53, hits: 622, avg: '.283', avgValue: 0.283, stolenBases: 21, value: 53, formattedValue: '53' },
          { id: 'b-hr-21', rank: 21, player: 'José Celestino López', seasons: '2001-2018', startYear: 2001, endYear: 2018, teams: ['Lara', 'Caribes'], games: 432, atBats: 1612, homeRuns: 49, hits: 472, avg: '.293', avgValue: 0.293, stolenBases: 19, value: 49, formattedValue: '49' },
          { id: 'b-hr-22', rank: 22, player: 'Luis Camaleón García', seasons: '1949-1969', startYear: 1949, endYear: 1969, teams: ['Magallanes', 'Oriente', 'La Guaira'], games: 1058, atBats: 3774, homeRuns: 48, hits: 1065, avg: '.282', avgValue: 0.282, stolenBases: 62, value: 48, formattedValue: '48' },
        ];

      case 'H':
        return [
          { id: 'b-h-1', rank: 1, player: 'Víctor Davalillo', seasons: '1957-1987', startYear: 1957, endYear: 1987, teams: ['Caracas', 'Tigres'], games: 1282, atBats: 4633, homeRuns: 34, hits: 1505, avg: '.325', avgValue: 0.325, stolenBases: 137, value: 1505, formattedValue: '1,505' },
          { id: 'b-h-2', rank: 2, player: 'Robert Pérez', seasons: '1988-2015', startYear: 1988, endYear: 2015, teams: ['Lara'], games: 1300, atBats: 4859, homeRuns: 125, hits: 1369, avg: '.282', avgValue: 0.282, stolenBases: 77, value: 1369, formattedValue: '1,369' },
          { id: 'b-h-3', rank: 3, player: 'Teolindo Acosta', seasons: '1956-1979', startYear: 1956, endYear: 1979, teams: ['Lara', 'Magallanes', 'Zulia'], games: 1130, atBats: 4325, homeRuns: 19, hits: 1289, avg: '.298', avgValue: 0.298, stolenBases: 118, value: 1289, formattedValue: '1,289' },
          { id: 'b-h-4', rank: 4, player: 'César Tovar', seasons: '1959-1986', startYear: 1959, endYear: 1986, teams: ['Caracas', 'Zulia', 'Tigres'], games: 1116, atBats: 4148, homeRuns: 43, hits: 1224, avg: '.295', avgValue: 0.295, stolenBases: 124, value: 1224, formattedValue: '1,224' },
          { id: 'b-h-5', rank: 5, player: 'Luis Camaleón García', seasons: '1949-1969', startYear: 1949, endYear: 1969, teams: ['Magallanes', 'Oriente', 'La Guaira'], games: 1058, atBats: 3774, homeRuns: 48, hits: 1065, avg: '.282', avgValue: 0.282, stolenBases: 62, value: 1065, formattedValue: '1,065' },
          { id: 'b-h-6', rank: 6, player: 'René Reyes', seasons: '1998-2022', startYear: 1998, endYear: 2022, teams: ['Caracas', 'Lara', 'Margarita', 'Caribes'], games: 1042, atBats: 3698, homeRuns: 83, hits: 1048, avg: '.283', avgValue: 0.283, stolenBases: 68, value: 1048, formattedValue: '1,048' },
          { id: 'b-h-7', rank: 7, player: 'José Castillo', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Caracas', 'Lara', 'Tiburones'], games: 973, atBats: 3411, homeRuns: 90, hits: 1032, avg: '.303', avgValue: 0.303, stolenBases: 61, value: 1032, formattedValue: '1,032' },
          { id: 'b-h-8', rank: 8, player: 'Tomás Pérez', seasons: '1991-2015', startYear: 1991, endYear: 2015, teams: ['Magallanes', 'Pastora', 'La Guaira', 'Caribes'], games: 1050, atBats: 3619, homeRuns: 24, hits: 1005, avg: '.278', avgValue: 0.278, stolenBases: 45, value: 1005, formattedValue: '1,005' },
          { id: 'b-h-9', rank: 9, player: 'Alex Romero', seasons: '2001-2024', startYear: 2001, endYear: 2024, teams: ['Tigres', 'Zulia'], games: 984, atBats: 3326, homeRuns: 32, hits: 1001, avg: '.301', avgValue: 0.301, stolenBases: 62, value: 1001, formattedValue: '1,001' },
          { id: 'b-h-10', rank: 10, player: 'Gustavo Gil', seasons: '1959-1978', startYear: 1959, endYear: 1978, teams: ['Magallanes', 'Lara'], games: 981, atBats: 3512, homeRuns: 16, hits: 982, avg: '.280', avgValue: 0.280, stolenBases: 129, value: 982, formattedValue: '982' },
          { id: 'b-h-11', rank: 11, player: 'Oscar Salazar', seasons: '1997-2017', startYear: 1997, endYear: 2017, teams: ['Pastora', 'La Guaira', 'Caribes'], games: 873, atBats: 3108, homeRuns: 94, hits: 864, avg: '.278', avgValue: 0.278, stolenBases: 26, value: 864, formattedValue: '864' },
          { id: 'b-h-12', rank: 12, player: 'Alfonso Carrasquel', seasons: '1946-1967', startYear: 1946, endYear: 1967, teams: ['Caracas', 'Pampero'], games: 781, atBats: 3064, homeRuns: 46, hits: 852, avg: '.278', avgValue: 0.278, stolenBases: 48, value: 852, formattedValue: '852' },
          { id: 'b-h-13', rank: 13, player: 'David Concepción', seasons: '1967-1990', startYear: 1967, endYear: 1990, teams: ['Tigres'], games: 791, atBats: 2870, homeRuns: 43, hits: 818, avg: '.285', avgValue: 0.285, stolenBases: 68, value: 818, formattedValue: '818' },
          { id: 'b-h-14', rank: 14, player: 'Frank Díaz', seasons: '2001-2022', startYear: 2001, endYear: 2022, teams: ['Magallanes', 'Bravos'], games: 835, atBats: 2884, homeRuns: 67, hits: 812, avg: '.282', avgValue: 0.282, stolenBases: 41, value: 812, formattedValue: '812' },
          { id: 'b-h-15', rank: 15, player: 'Gonzalo Márquez', seasons: '1965-1984', startYear: 1965, endYear: 1984, teams: ['Caracas', 'Magallanes'], games: 820, atBats: 2840, homeRuns: 54, hits: 812, avg: '.286', avgValue: 0.286, stolenBases: 39, value: 812, formattedValue: '812' },
          { id: 'b-h-16', rank: 16, player: 'Oswaldo Blanco', seasons: '1963-1983', startYear: 1963, endYear: 1983, teams: ['La Guaira'], games: 840, atBats: 2855, homeRuns: 38, hits: 802, avg: '.281', avgValue: 0.281, stolenBases: 33, value: 802, formattedValue: '802' },
          { id: 'b-h-17', rank: 17, player: 'Eliezer Alfonzo', seasons: '1997-2018', startYear: 1997, endYear: 2018, teams: ['Caribes', 'Magallanes'], games: 808, atBats: 2841, homeRuns: 138, hits: 785, avg: '.276', avgValue: 0.276, stolenBases: 1, value: 785, formattedValue: '785' },
          { id: 'b-h-18', rank: 18, player: 'Héctor Giménez', seasons: '2000-2019', startYear: 2000, endYear: 2019, teams: ['Magallanes', 'Tigres', 'Águilas'], games: 742, atBats: 2548, homeRuns: 82, hits: 718, avg: '.282', avgValue: 0.282, stolenBases: 14, value: 718, formattedValue: '718' },
          { id: 'b-h-19', rank: 19, player: 'Antonio Armas', seasons: '1972-1991', startYear: 1972, endYear: 1991, teams: ['Caracas', 'Caribes'], games: 787, atBats: 2831, homeRuns: 97, hits: 713, avg: '.252', avgValue: 0.252, stolenBases: 32, value: 713, formattedValue: '713' },
          { id: 'b-h-20', rank: 20, player: 'Leonardo Hernández', seasons: '1977-1993', startYear: 1977, endYear: 1993, teams: ['Caracas', 'Zulia', 'Tigres'], games: 739, atBats: 2608, homeRuns: 72, hits: 712, avg: '.273', avgValue: 0.273, stolenBases: 145, value: 712, formattedValue: '712' },
          { id: 'b-h-21', rank: 21, player: 'Alex Cabrera', seasons: '1994-2017', startYear: 1994, endYear: 2017, teams: ['Pastora', 'Tiburones', 'Tigres'], games: 664, atBats: 2337, homeRuns: 135, hits: 706, avg: '.302', avgValue: 0.302, stolenBases: 22, value: 706, formattedValue: '706' },
        ];

      case 'AVG':
        return [
          { id: 'b-avg-1', rank: 1, player: 'Ramón Flores', seasons: '2021-2022', startYear: 2021, endYear: 2022, teams: ['Bravos'], games: 45, atBats: 161, homeRuns: 4, hits: 67, avg: '.416', avgValue: 0.416, stolenBases: 8, value: 0.416, formattedValue: '.416' },
          { id: 'b-avg-2', rank: 2, player: 'Freddy Fermín', seasons: '2022-2023', startYear: 2022, endYear: 2023, teams: ['Caracas'], games: 45, atBats: 166, homeRuns: 4, hits: 67, avg: '.404', avgValue: 0.404, stolenBases: 3, value: 0.404, formattedValue: '.404' },
          { id: 'b-avg-3', rank: 3, player: 'Dave Parker', seasons: '1976-1977', startYear: 1976, endYear: 1977, teams: ['Magallanes'], games: 46, atBats: 167, homeRuns: 14, hits: 67, avg: '.401', avgValue: 0.401, stolenBases: 5, value: 0.401, formattedValue: '.401' },
          { id: 'b-avg-4', rank: 4, player: 'Lorenzo Cedrola', seasons: '2025-2026', startYear: 2025, endYear: 2026, teams: ['Tigres'], games: 52, atBats: 190, homeRuns: 6, hits: 75, avg: '.395', avgValue: 0.395, stolenBases: 14, value: 0.395, formattedValue: '.395' },
          { id: 'b-avg-5', rank: 5, player: 'Gabriel Noriega', seasons: '2023-2024', startYear: 2023, endYear: 2024, teams: ['Caracas'], games: 55, atBats: 197, homeRuns: 3, hits: 74, avg: '.376', avgValue: 0.376, stolenBases: 2, value: 0.376, formattedValue: '.376' },
          { id: 'b-avg-6', rank: 6, player: 'Gorkys Hernández', seasons: '2024-2025', startYear: 2024, endYear: 2025, teams: ['Lara'], games: 49, atBats: 171, homeRuns: 8, hits: 64, avg: '.374', avgValue: 0.374, stolenBases: 9, value: 0.374, formattedValue: '.374' },
          { id: 'b-avg-7', rank: 7, player: 'Víctor Davalillo', seasons: '1957-1987', startYear: 1957, endYear: 1987, teams: ['Caracas', 'Tigres'], games: 1282, atBats: 4633, homeRuns: 34, hits: 1505, avg: '.325', avgValue: 0.325, stolenBases: 137, value: 0.325, formattedValue: '.325' },
          { id: 'b-avg-8', rank: 8, player: 'Ernesto Mejía', seasons: '2007-2015', startYear: 2007, endYear: 2015, teams: ['Águilas'], games: 334, atBats: 1215, homeRuns: 57, hits: 373, avg: '.307', avgValue: 0.307, stolenBases: 6, value: 0.307, formattedValue: '.307' },
          { id: 'b-avg-9', rank: 9, player: 'Bob Abreu', seasons: '1991-2015', startYear: 1991, endYear: 2015, teams: ['Caracas'], games: 563, atBats: 1890, homeRuns: 43, hits: 575, avg: '.304', avgValue: 0.304, stolenBases: 73, value: 0.304, formattedValue: '.304' },
          { id: 'b-avg-10', rank: 10, player: 'José Castillo', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Caracas', 'Lara', 'Tiburones'], games: 973, atBats: 3411, homeRuns: 90, hits: 1032, avg: '.303', avgValue: 0.303, stolenBases: 61, value: 0.303, formattedValue: '.303' },
          { id: 'b-avg-11', rank: 11, player: 'Alex Cabrera', seasons: '1994-2017', startYear: 1994, endYear: 2017, teams: ['Pastora', 'Tiburones', 'Tigres'], games: 664, atBats: 2337, homeRuns: 135, hits: 706, avg: '.302', avgValue: 0.302, stolenBases: 22, value: 0.302, formattedValue: '.302' },
          { id: 'b-avg-12', rank: 12, player: 'Magglio Ordóñez', seasons: '1991-2004', startYear: 1991, endYear: 2004, teams: ['Caribes'], games: 412, atBats: 1452, homeRuns: 30, hits: 438, avg: '.302', avgValue: 0.302, stolenBases: 35, value: 0.302, formattedValue: '.302' },
          { id: 'b-avg-13', rank: 13, player: 'Alex Romero', seasons: '2001-2024', startYear: 2001, endYear: 2024, teams: ['Tigres', 'Zulia'], games: 984, atBats: 3326, homeRuns: 32, hits: 1001, avg: '.301', avgValue: 0.301, stolenBases: 62, value: 0.301, formattedValue: '.301' },
          { id: 'b-avg-14', rank: 14, player: 'Luis Jiménez', seasons: '2001-2020', startYear: 2001, endYear: 2020, teams: ['Lara', 'Caribes', 'Águilas'], games: 705, atBats: 2269, homeRuns: 66, hits: 678, avg: '.299', avgValue: 0.299, stolenBases: 11, value: 0.299, formattedValue: '.299' },
          { id: 'b-avg-15', rank: 15, player: 'Teolindo Acosta', seasons: '1956-1979', startYear: 1956, endYear: 1979, teams: ['Lara', 'Magallanes', 'Zulia'], games: 1130, atBats: 4325, homeRuns: 19, hits: 1289, avg: '.298', avgValue: 0.298, stolenBases: 118, value: 0.298, formattedValue: '.298' },
          { id: 'b-avg-16', rank: 16, player: 'Edgardo Alfonzo', seasons: '1992-2008', startYear: 1992, endYear: 2008, teams: ['Magallanes', 'La Guaira'], games: 456, atBats: 1572, homeRuns: 28, hits: 465, avg: '.296', avgValue: 0.296, stolenBases: 27, value: 0.296, formattedValue: '.296' },
          { id: 'b-avg-17', rank: 17, player: 'César Tovar', seasons: '1959-1986', startYear: 1959, endYear: 1986, teams: ['Caracas', 'Zulia', 'Tigres'], games: 1116, atBats: 4148, homeRuns: 43, hits: 1224, avg: '.295', avgValue: 0.295, stolenBases: 124, value: 0.295, formattedValue: '.295' },
          { id: 'b-avg-18', rank: 18, player: 'Jesús Alfaro', seasons: '1981-1996', startYear: 1981, endYear: 1996, teams: ['Caracas', 'Pastora'], games: 678, atBats: 2310, homeRuns: 27, hits: 681, avg: '.295', avgValue: 0.295, stolenBases: 38, value: 0.295, formattedValue: '.295' },
          { id: 'b-avg-19', rank: 19, player: 'José Celestino López', seasons: '2001-2018', startYear: 2001, endYear: 2018, teams: ['Lara', 'Caribes'], games: 432, atBats: 1612, homeRuns: 49, hits: 472, avg: '.293', avgValue: 0.293, stolenBases: 19, value: 0.293, formattedValue: '.293' },
          { id: 'b-avg-20', rank: 20, player: 'Gonzalo Márquez', seasons: '1965-1984', startYear: 1965, endYear: 1984, teams: ['Caracas', 'Magallanes'], games: 820, atBats: 2840, homeRuns: 54, hits: 812, avg: '.286', avgValue: 0.286, stolenBases: 39, value: 0.286, formattedValue: '.286' },
        ];

      case 'SB':
        return [
          { id: 'b-sb-1', rank: 1, player: 'José Leiva', seasons: '1979-1994', startYear: 1979, endYear: 1994, teams: ['Caracas'], games: 638, atBats: 2102, homeRuns: 11, hits: 559, avg: '.266', avgValue: 0.266, stolenBases: 152, value: 152, formattedValue: '152' },
          { id: 'b-sb-2', rank: 2, player: 'Leonardo Hernández', seasons: '1977-1993', startYear: 1977, endYear: 1993, teams: ['Caracas', 'Zulia', 'Tigres'], games: 739, atBats: 2608, homeRuns: 72, hits: 712, avg: '.273', avgValue: 0.273, stolenBases: 145, value: 145, formattedValue: '145' },
          { id: 'b-sb-3', rank: 3, player: 'Víctor Davalillo', seasons: '1957-1987', startYear: 1957, endYear: 1987, teams: ['Caracas', 'Tigres'], games: 1282, atBats: 4633, homeRuns: 34, hits: 1505, avg: '.325', avgValue: 0.325, stolenBases: 137, value: 137, formattedValue: '137' },
          { id: 'b-sb-4', rank: 4, player: 'Gustavo Gil', seasons: '1959-1978', startYear: 1959, endYear: 1978, teams: ['Magallanes', 'Lara'], games: 981, atBats: 3512, homeRuns: 16, hits: 982, avg: '.280', avgValue: 0.280, stolenBases: 129, value: 129, formattedValue: '129' },
          { id: 'b-sb-5', rank: 5, player: 'Roger Cedeño', seasons: '1993-2007', startYear: 1993, endYear: 2007, teams: ['Caracas'], games: 412, atBats: 1504, homeRuns: 15, hits: 442, avg: '.294', avgValue: 0.294, stolenBases: 125, value: 125, formattedValue: '125' },
          { id: 'b-sb-6', rank: 6, player: 'César Tovar', seasons: '1959-1986', startYear: 1959, endYear: 1986, teams: ['Caracas', 'Zulia', 'Tigres'], games: 1116, atBats: 4148, homeRuns: 43, hits: 1224, avg: '.295', avgValue: 0.295, stolenBases: 124, value: 124, formattedValue: '124' },
          { id: 'b-sb-7', rank: 7, player: 'Teolindo Acosta', seasons: '1956-1979', startYear: 1956, endYear: 1979, teams: ['Lara', 'Magallanes', 'Zulia'], games: 1130, atBats: 4325, homeRuns: 19, hits: 1289, avg: '.298', avgValue: 0.298, stolenBases: 118, value: 118, formattedValue: '118' },
          { id: 'b-sb-8', rank: 8, player: 'Elvis Andrus', seasons: '2005-2015', startYear: 2005, endYear: 2015, teams: ['Magallanes'], games: 320, atBats: 1180, homeRuns: 9, hits: 334, avg: '.283', avgValue: 0.283, stolenBases: 86, value: 86, formattedValue: '86' },
          { id: 'b-sb-9', rank: 9, player: 'Ezequiel Carrera', seasons: '2008-2021', startYear: 2008, endYear: 2021, teams: ['Magallanes', 'Tigres'], games: 418, atBats: 1475, homeRuns: 14, hits: 412, avg: '.279', avgValue: 0.279, stolenBases: 78, value: 78, formattedValue: '78' },
          { id: 'b-sb-10', rank: 10, player: 'Robert Pérez', seasons: '1988-2015', startYear: 1988, endYear: 2015, teams: ['Lara'], games: 1300, atBats: 4859, homeRuns: 125, hits: 1369, avg: '.282', avgValue: 0.282, stolenBases: 77, value: 77, formattedValue: '77' },
          { id: 'b-sb-11', rank: 11, player: 'Endy Chávez', seasons: '1996-2019', startYear: 1996, endYear: 2019, teams: ['Magallanes', 'Tiburones'], games: 567, atBats: 2043, homeRuns: 18, hits: 597, avg: '.292', avgValue: 0.292, stolenBases: 74, value: 74, formattedValue: '74' },
          { id: 'b-sb-12', rank: 12, player: 'Bob Abreu', seasons: '1991-2015', startYear: 1991, endYear: 2015, teams: ['Caracas'], games: 563, atBats: 1890, homeRuns: 43, hits: 575, avg: '.304', avgValue: 0.304, stolenBases: 73, value: 73, formattedValue: '73' },
          { id: 'b-sb-13', rank: 13, player: 'David Concepción', seasons: '1967-1990', startYear: 1967, endYear: 1990, teams: ['Tigres'], games: 791, atBats: 2870, homeRuns: 43, hits: 818, avg: '.285', avgValue: 0.285, stolenBases: 68, value: 68, formattedValue: '68' },
          { id: 'b-sb-14', rank: 14, player: 'René Reyes', seasons: '1998-2022', startYear: 1998, endYear: 2022, teams: ['Caracas', 'Lara', 'Margarita', 'Caribes'], games: 1042, atBats: 3698, homeRuns: 83, hits: 1048, avg: '.283', avgValue: 0.283, stolenBases: 68, value: 68, formattedValue: '68' },
          { id: 'b-sb-15', rank: 15, player: 'Alex Romero', seasons: '2001-2024', startYear: 2001, endYear: 2024, teams: ['Tigres', 'Zulia'], games: 984, atBats: 3326, homeRuns: 32, hits: 1001, avg: '.301', avgValue: 0.301, stolenBases: 62, value: 62, formattedValue: '62' },
          { id: 'b-sb-16', rank: 16, player: 'Luis Camaleón García', seasons: '1949-1969', startYear: 1949, endYear: 1969, teams: ['Magallanes', 'Oriente', 'La Guaira'], games: 1058, atBats: 3774, homeRuns: 48, hits: 1065, avg: '.282', avgValue: 0.282, stolenBases: 62, value: 62, formattedValue: '62' },
          { id: 'b-sb-17', rank: 17, player: 'José Castillo', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Caracas', 'Lara', 'Tiburones'], games: 973, atBats: 3411, homeRuns: 90, hits: 1032, avg: '.303', avgValue: 0.303, stolenBases: 61, value: 61, formattedValue: '61' },
          { id: 'b-sb-18', rank: 18, player: 'Alfonso Carrasquel', seasons: '1946-1967', startYear: 1946, endYear: 1967, teams: ['Caracas', 'Pampero'], games: 781, atBats: 3064, homeRuns: 46, hits: 852, avg: '.278', avgValue: 0.278, stolenBases: 48, value: 48, formattedValue: '48' },
          { id: 'b-sb-19', rank: 19, player: 'Tomás Pérez', seasons: '1991-2015', startYear: 1991, endYear: 2015, teams: ['Magallanes', 'Pastora', 'La Guaira', 'Caribes'], games: 1050, atBats: 3619, homeRuns: 24, hits: 1005, avg: '.278', avgValue: 0.278, stolenBases: 45, value: 45, formattedValue: '45' },
          { id: 'b-sb-20', rank: 20, player: 'Frank Díaz', seasons: '2001-2022', startYear: 2001, endYear: 2022, teams: ['Magallanes', 'Bravos'], games: 835, atBats: 2884, homeRuns: 67, hits: 812, avg: '.282', avgValue: 0.282, stolenBases: 41, value: 41, formattedValue: '41' },
        ];
    }
  }

  // ---------------------------------------------------------------------------
  // RAW PITCHING DATASETS (Authentic historical LVBP records)
  // ---------------------------------------------------------------------------

  private getRawPitchingData(category: PitchingCategory): PitchingPlayerStat[] {
    switch (category) {
      case 'W':
        return [
          { id: 'p-w-1', rank: 1, player: 'José Bracho', seasons: '1948-1973', startYear: 1948, endYear: 1973, teams: ['Caracas', 'Magallanes', 'Zulia'], inningsPitched: '1,769.2', ipValue: 1769.2, era: '3.17', eraValue: 3.17, wins: 109, strikeouts: 850, saves: 16, value: 109, formattedValue: '109' },
          { id: 'p-w-2', rank: 2, player: 'Emilio Cueche', seasons: '1950-1965', startYear: 1950, endYear: 1965, teams: ['Caracas', 'Magallanes', 'La Guaira'], inningsPitched: '1,421.0', ipValue: 1421.0, era: '3.08', eraValue: 3.08, wins: 87, strikeouts: 531, saves: 12, value: 87, formattedValue: '87' },
          { id: 'p-w-3', rank: 3, player: 'Luis Peñalver', seasons: '1960-1983', startYear: 1960, endYear: 1983, teams: ['Caracas', 'Zulia', 'Tigres'], inningsPitched: '1,514.1', ipValue: 1514.1, era: '3.07', eraValue: 3.07, wins: 84, strikeouts: 748, saves: 19, value: 84, formattedValue: '84' },
          { id: 'p-w-4', rank: 4, player: 'Carrao Bracho', seasons: '1952-1970', startYear: 1952, endYear: 1970, teams: ['Zulia', 'Pastora', 'Caracas'], inningsPitched: '1,310.2', ipValue: 1310.2, era: '3.19', eraValue: 3.19, wins: 82, strikeouts: 560, saves: 14, value: 82, formattedValue: '82' },
          { id: 'p-w-5', rank: 5, player: 'Giovanni Carrara', seasons: '1990-2011', startYear: 1990, endYear: 2011, teams: ['Lara'], inningsPitched: '1,012.0', ipValue: 1012.0, era: '2.93', eraValue: 2.93, wins: 67, strikeouts: 634, saves: 56, value: 67, formattedValue: '67' },
          { id: 'p-w-6', rank: 6, player: 'Diego Seguí', seasons: '1962-1979', startYear: 1962, endYear: 1979, teams: ['Caracas', 'La Guaira'], inningsPitched: '1,178.0', ipValue: 1178.0, era: '2.76', eraValue: 2.76, wins: 64, strikeouts: 578, saves: 21, value: 64, formattedValue: '64' },
          { id: 'p-w-7', rank: 7, player: 'Roberto Muñoz', seasons: '1968-1983', startYear: 1968, endYear: 1983, teams: ['Magallanes', 'Tigres'], inningsPitched: '1,098.2', ipValue: 1098.2, era: '2.92', eraValue: 2.92, wins: 64, strikeouts: 581, saves: 51, value: 64, formattedValue: '64' },
          { id: 'p-w-8', rank: 8, player: 'Aurelio Monteagudo', seasons: '1963-1982', startYear: 1963, endYear: 1982, teams: ['Caracas', 'La Guaira', 'Magallanes'], inningsPitched: '1,108.1', ipValue: 1108.1, era: '3.12', eraValue: 3.12, wins: 63, strikeouts: 535, saves: 31, value: 63, formattedValue: '63' },
          { id: 'p-w-9', rank: 9, player: 'Urbano Lugo Sr.', seasons: '1963-1975', startYear: 1963, endYear: 1975, teams: ['La Guaira'], inningsPitched: '912.1', ipValue: 912.1, era: '2.75', eraValue: 2.75, wins: 52, strikeouts: 412, saves: 18, value: 52, formattedValue: '52' },
          { id: 'p-w-10', rank: 10, player: 'Urbano Lugo Jr.', seasons: '1981-1998', startYear: 1981, endYear: 1998, teams: ['Caracas'], inningsPitched: '984.0', ipValue: 984.0, era: '3.38', eraValue: 3.38, wins: 52, strikeouts: 507, saves: 11, value: 52, formattedValue: '52' },
          { id: 'p-w-11', rank: 11, player: 'Horacio Estrada', seasons: '1995-2012', startYear: 1995, endYear: 2012, teams: ['Tigres', 'Caracas', 'Pastora'], inningsPitched: '852.1', ipValue: 852.1, era: '3.62', eraValue: 3.62, wins: 50, strikeouts: 421, saves: 8, value: 50, formattedValue: '50' },
          { id: 'p-w-12', rank: 12, player: 'Omar Daal', seasons: '1989-2004', startYear: 1989, endYear: 2004, teams: ['Caracas', 'La Guaira'], inningsPitched: '764.2', ipValue: 764.2, era: '3.11', eraValue: 3.11, wins: 48, strikeouts: 438, saves: 15, value: 48, formattedValue: '48' },
          { id: 'p-w-13', rank: 13, player: 'Juan Carlos Pulido', seasons: '1988-2008', startYear: 1988, endYear: 2008, teams: ['Tigres', 'Magallanes', 'Lara'], inningsPitched: '870.0', ipValue: 870.0, era: '3.42', eraValue: 3.42, wins: 45, strikeouts: 389, saves: 14, value: 45, formattedValue: '45' },
          { id: 'p-w-14', rank: 14, player: 'Wilson Álvarez', seasons: '1986-2003', startYear: 1986, endYear: 2003, teams: ['Zulia'], inningsPitched: '689.1', ipValue: 689.1, era: '2.49', eraValue: 2.49, wins: 43, strikeouts: 420, saves: 5, value: 43, formattedValue: '43' },
          { id: 'p-w-15', rank: 15, player: 'Richard Garcés', seasons: '1989-2008', startYear: 1989, endYear: 2008, teams: ['Tigres', 'Magallanes'], inningsPitched: '542.0', ipValue: 542.0, era: '2.54', eraValue: 2.54, wins: 41, strikeouts: 482, saves: 124, value: 41, formattedValue: '41' },
          { id: 'p-w-16', rank: 16, player: 'Luis Aponte', seasons: '1973-1991', startYear: 1973, endYear: 1991, teams: ['Caracas', 'La Guaira'], inningsPitched: '741.0', ipValue: 741.0, era: '2.98', eraValue: 2.98, wins: 40, strikeouts: 395, saves: 53, value: 40, formattedValue: '40' },
          { id: 'p-w-17', rank: 17, player: 'Felipe Lira', seasons: '1992-2007', startYear: 1992, endYear: 2007, teams: ['La Guaira', 'Pastora'], inningsPitched: '730.0', ipValue: 730.0, era: '3.71', eraValue: 3.71, wins: 38, strikeouts: 362, saves: 12, value: 38, formattedValue: '38' },
          { id: 'p-w-18', rank: 18, player: 'Francisco Buttó', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Tigres', 'Caribes', 'La Guaira'], inningsPitched: '498.2', ipValue: 498.2, era: '3.21', eraValue: 3.21, wins: 36, strikeouts: 374, saves: 88, value: 36, formattedValue: '36' },
          { id: 'p-w-19', rank: 19, player: 'Bud Black', seasons: '1979-1984', startYear: 1979, endYear: 1984, teams: ['La Guaira'], inningsPitched: '420.0', ipValue: 420.0, era: '2.80', eraValue: 2.80, wins: 31, strikeouts: 280, saves: 8, value: 31, formattedValue: '31' },
          { id: 'p-w-20', rank: 20, player: 'Jean Machí', seasons: '2004-2024', startYear: 2004, endYear: 2024, teams: ['Magallanes', 'Tigres', 'Caracas'], inningsPitched: '412.1', ipValue: 412.1, era: '3.15', eraValue: 3.15, wins: 29, strikeouts: 341, saves: 62, value: 29, formattedValue: '29' },
        ];

      case 'SO':
        return [
          { id: 'p-so-1', rank: 1, player: 'José Bracho', seasons: '1948-1973', startYear: 1948, endYear: 1973, teams: ['Caracas', 'Magallanes', 'Zulia'], inningsPitched: '1,769.2', ipValue: 1769.2, era: '3.17', eraValue: 3.17, wins: 109, strikeouts: 850, saves: 16, value: 850, formattedValue: '850' },
          { id: 'p-so-2', rank: 2, player: 'Luis Peñalver', seasons: '1960-1983', startYear: 1960, endYear: 1983, teams: ['Caracas', 'Zulia', 'Tigres'], inningsPitched: '1,514.1', ipValue: 1514.1, era: '3.07', eraValue: 3.07, wins: 84, strikeouts: 748, saves: 19, value: 748, formattedValue: '748' },
          { id: 'p-so-3', rank: 3, player: 'Giovanni Carrara', seasons: '1990-2011', startYear: 1990, endYear: 2011, teams: ['Lara'], inningsPitched: '1,012.0', ipValue: 1012.0, era: '2.93', eraValue: 2.93, wins: 67, strikeouts: 634, saves: 56, value: 634, formattedValue: '634' },
          { id: 'p-so-4', rank: 4, player: 'Roberto Muñoz', seasons: '1968-1983', startYear: 1968, endYear: 1983, teams: ['Magallanes', 'Tigres'], inningsPitched: '1,098.2', ipValue: 1098.2, era: '2.92', eraValue: 2.92, wins: 64, strikeouts: 581, saves: 51, value: 581, formattedValue: '581' },
          { id: 'p-so-5', rank: 5, player: 'Diego Seguí', seasons: '1962-1979', startYear: 1962, endYear: 1979, teams: ['Caracas', 'La Guaira'], inningsPitched: '1,178.0', ipValue: 1178.0, era: '2.76', eraValue: 2.76, wins: 64, strikeouts: 578, saves: 21, value: 578, formattedValue: '578' },
          { id: 'p-so-6', rank: 6, player: 'Carrao Bracho', seasons: '1952-1970', startYear: 1952, endYear: 1970, teams: ['Zulia', 'Pastora', 'Caracas'], inningsPitched: '1,310.2', ipValue: 1310.2, era: '3.19', eraValue: 3.19, wins: 82, strikeouts: 560, saves: 14, value: 560, formattedValue: '560' },
          { id: 'p-so-7', rank: 7, player: 'Aurelio Monteagudo', seasons: '1963-1982', startYear: 1963, endYear: 1982, teams: ['Caracas', 'La Guaira', 'Magallanes'], inningsPitched: '1,108.1', ipValue: 1108.1, era: '3.12', eraValue: 3.12, wins: 63, strikeouts: 535, saves: 31, value: 535, formattedValue: '535' },
          { id: 'p-so-8', rank: 8, player: 'Emilio Cueche', seasons: '1950-1965', startYear: 1950, endYear: 1965, teams: ['Caracas', 'Magallanes', 'La Guaira'], inningsPitched: '1,421.0', ipValue: 1421.0, era: '3.08', eraValue: 3.08, wins: 87, strikeouts: 531, saves: 12, value: 531, formattedValue: '531' },
          { id: 'p-so-9', rank: 9, player: 'Urbano Lugo Jr.', seasons: '1981-1998', startYear: 1981, endYear: 1998, teams: ['Caracas'], inningsPitched: '984.0', ipValue: 984.0, era: '3.38', eraValue: 3.38, wins: 52, strikeouts: 507, saves: 11, value: 507, formattedValue: '507' },
          { id: 'p-so-10', rank: 10, player: 'Richard Garcés', seasons: '1989-2008', startYear: 1989, endYear: 2008, teams: ['Tigres', 'Magallanes'], inningsPitched: '542.0', ipValue: 542.0, era: '2.54', eraValue: 2.54, wins: 41, strikeouts: 482, saves: 124, value: 482, formattedValue: '482' },
          { id: 'p-so-11', rank: 11, player: 'Omar Daal', seasons: '1989-2004', startYear: 1989, endYear: 2004, teams: ['Caracas', 'La Guaira'], inningsPitched: '764.2', ipValue: 764.2, era: '3.11', eraValue: 3.11, wins: 48, strikeouts: 438, saves: 15, value: 438, formattedValue: '438' },
          { id: 'p-so-12', rank: 12, player: 'Horacio Estrada', seasons: '1995-2012', startYear: 1995, endYear: 2012, teams: ['Tigres', 'Caracas', 'Pastora'], inningsPitched: '852.1', ipValue: 852.1, era: '3.62', eraValue: 3.62, wins: 50, strikeouts: 421, saves: 8, value: 421, formattedValue: '421' },
          { id: 'p-so-13', rank: 13, player: 'Wilson Álvarez', seasons: '1986-2003', startYear: 1986, endYear: 2003, teams: ['Zulia'], inningsPitched: '689.1', ipValue: 689.1, era: '2.49', eraValue: 2.49, wins: 43, strikeouts: 420, saves: 5, value: 420, formattedValue: '420' },
          { id: 'p-so-14', rank: 14, player: 'Urbano Lugo Sr.', seasons: '1963-1975', startYear: 1963, endYear: 1975, teams: ['La Guaira'], inningsPitched: '912.1', ipValue: 912.1, era: '2.75', eraValue: 2.75, wins: 52, strikeouts: 412, saves: 18, value: 412, formattedValue: '412' },
          { id: 'p-so-15', rank: 15, player: 'Luis Aponte', seasons: '1973-1991', startYear: 1973, endYear: 1991, teams: ['Caracas', 'La Guaira'], inningsPitched: '741.0', ipValue: 741.0, era: '2.98', eraValue: 2.98, wins: 40, strikeouts: 395, saves: 53, value: 395, formattedValue: '395' },
          { id: 'p-so-16', rank: 16, player: 'Juan Carlos Pulido', seasons: '1988-2008', startYear: 1988, endYear: 2008, teams: ['Tigres', 'Magallanes', 'Lara'], inningsPitched: '870.0', ipValue: 870.0, era: '3.42', eraValue: 3.42, wins: 45, strikeouts: 389, saves: 14, value: 389, formattedValue: '389' },
          { id: 'p-so-17', rank: 17, player: 'Francisco Buttó', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Tigres', 'Caribes', 'La Guaira'], inningsPitched: '498.2', ipValue: 498.2, era: '3.21', eraValue: 3.21, wins: 36, strikeouts: 374, saves: 88, value: 374, formattedValue: '374' },
          { id: 'p-so-18', rank: 18, player: 'Felipe Lira', seasons: '1992-2007', startYear: 1992, endYear: 2007, teams: ['La Guaira', 'Pastora'], inningsPitched: '730.0', ipValue: 730.0, era: '3.71', eraValue: 3.71, wins: 38, strikeouts: 362, saves: 12, value: 362, formattedValue: '362' },
          { id: 'p-so-19', rank: 19, player: 'Jean Machí', seasons: '2004-2024', startYear: 2004, endYear: 2024, teams: ['Magallanes', 'Tigres', 'Caracas'], inningsPitched: '412.1', ipValue: 412.1, era: '3.15', eraValue: 3.15, wins: 29, strikeouts: 341, saves: 62, value: 341, formattedValue: '341' },
          { id: 'p-so-20', rank: 20, player: 'Bud Black', seasons: '1979-1984', startYear: 1979, endYear: 1984, teams: ['La Guaira'], inningsPitched: '420.0', ipValue: 420.0, era: '2.80', eraValue: 2.80, wins: 31, strikeouts: 280, saves: 8, value: 280, formattedValue: '280' },
        ];

      case 'SV':
        return [
          { id: 'p-sv-1', rank: 1, player: 'Richard Garcés', seasons: '1989-2008', startYear: 1989, endYear: 2008, teams: ['Tigres', 'Magallanes'], inningsPitched: '542.0', ipValue: 542.0, era: '2.54', eraValue: 2.54, wins: 41, strikeouts: 482, saves: 124, value: 124, formattedValue: '124' },
          { id: 'p-sv-2', rank: 2, player: 'Francisco Buttó', seasons: '1999-2019', startYear: 1999, endYear: 2019, teams: ['Tigres', 'Caribes', 'La Guaira'], inningsPitched: '498.2', ipValue: 498.2, era: '3.21', eraValue: 3.21, wins: 36, strikeouts: 374, saves: 88, value: 88, formattedValue: '88' },
          { id: 'p-sv-3', rank: 3, player: 'Hassan Pena', seasons: '2013-2018', startYear: 2013, endYear: 2018, teams: ['Magallanes', 'Tiburones'], inningsPitched: '168.1', ipValue: 168.1, era: '2.35', eraValue: 2.35, wins: 9, strikeouts: 178, saves: 86, value: 86, formattedValue: '86' },
          { id: 'p-sv-4', rank: 4, player: 'Pedro Rodríguez', seasons: '2010-2024', startYear: 2010, endYear: 2024, teams: ['Caribes', 'Magallanes', 'Tiburones'], inningsPitched: '315.0', ipValue: 315.0, era: '2.88', eraValue: 2.88, wins: 22, strikeouts: 265, saves: 76, value: 76, formattedValue: '76' },
          { id: 'p-sv-5', rank: 5, player: 'Jorge Julio Tapia', seasons: '1997-2012', startYear: 1997, endYear: 2012, teams: ['Caracas', 'Tiburones'], inningsPitched: '298.0', ipValue: 298.0, era: '2.78', eraValue: 2.78, wins: 18, strikeouts: 289, saves: 69, value: 69, formattedValue: '69' },
          { id: 'p-sv-6', rank: 6, player: 'Gregory Infante', seasons: '2008-2023', startYear: 2008, endYear: 2023, teams: ['La Guaira'], inningsPitched: '292.1', ipValue: 292.1, era: '3.42', eraValue: 3.42, wins: 17, strikeouts: 271, saves: 67, value: 67, formattedValue: '67' },
          { id: 'p-sv-7', rank: 7, player: 'Jean Machí', seasons: '2004-2024', startYear: 2004, endYear: 2024, teams: ['Magallanes', 'Tigres', 'Caracas'], inningsPitched: '412.1', ipValue: 412.1, era: '3.15', eraValue: 3.15, wins: 29, strikeouts: 341, saves: 62, value: 62, formattedValue: '62' },
          { id: 'p-sv-8', rank: 8, player: 'Giovanni Carrara', seasons: '1990-2011', startYear: 1990, endYear: 2011, teams: ['Lara'], inningsPitched: '1,012.0', ipValue: 1012.0, era: '2.93', eraValue: 2.93, wins: 67, strikeouts: 634, saves: 56, value: 56, formattedValue: '56' },
          { id: 'p-sv-9', rank: 9, player: 'Luis Aponte', seasons: '1973-1991', startYear: 1973, endYear: 1991, teams: ['Caracas', 'La Guaira'], inningsPitched: '741.0', ipValue: 741.0, era: '2.98', eraValue: 2.98, wins: 40, strikeouts: 395, saves: 53, value: 53, formattedValue: '53' },
          { id: 'p-sv-10', rank: 10, player: 'Roberto Muñoz', seasons: '1968-1983', startYear: 1968, endYear: 1983, teams: ['Magallanes', 'Tigres'], inningsPitched: '1,098.2', ipValue: 1098.2, era: '2.92', eraValue: 2.92, wins: 64, strikeouts: 581, saves: 51, value: 51, formattedValue: '51' },
          { id: 'p-sv-11', rank: 11, player: 'Jay Baller', seasons: '1987-1994', startYear: 1987, endYear: 1994, teams: ['Caracas'], inningsPitched: '210.1', ipValue: 210.1, era: '2.31', eraValue: 2.31, wins: 14, strikeouts: 205, saves: 48, value: 48, formattedValue: '48' },
          { id: 'p-sv-12', rank: 12, player: 'Santos Hernández', seasons: '1999-2004', startYear: 1999, endYear: 2004, teams: ['Pastora'], inningsPitched: '195.0', ipValue: 195.0, era: '2.40', eraValue: 2.40, wins: 12, strikeouts: 172, saves: 46, value: 46, formattedValue: '46' },
          { id: 'p-sv-13', rank: 13, player: 'Bruce Rondón', seasons: '2011-2023', startYear: 2011, endYear: 2023, teams: ['Magallanes', 'Tigres'], inningsPitched: '172.0', ipValue: 172.0, era: '2.98', eraValue: 2.98, wins: 11, strikeouts: 198, saves: 45, value: 45, formattedValue: '45' },
          { id: 'p-sv-14', rank: 14, player: 'Orber Moreno', seasons: '1996-2012', startYear: 1996, endYear: 2012, teams: ['Caracas'], inningsPitched: '280.1', ipValue: 280.1, era: '2.86', eraValue: 2.86, wins: 18, strikeouts: 260, saves: 44, value: 44, formattedValue: '44' },
          { id: 'p-sv-15', rank: 15, player: 'Ronald Belisario', seasons: '2004-2021', startYear: 2004, endYear: 2021, teams: ['La Guaira', 'Tigres'], inningsPitched: '310.2', ipValue: 310.2, era: '3.19', eraValue: 3.19, wins: 20, strikeouts: 245, saves: 42, value: 42, formattedValue: '42' },
          { id: 'p-sv-16', rank: 16, player: 'Aurelio Monteagudo', seasons: '1963-1982', startYear: 1963, endYear: 1982, teams: ['Caracas', 'La Guaira', 'Magallanes'], inningsPitched: '1,108.1', ipValue: 1108.1, era: '3.12', eraValue: 3.12, wins: 63, strikeouts: 535, saves: 31, value: 31, formattedValue: '31' },
          { id: 'p-sv-17', rank: 17, player: 'Diego Seguí', seasons: '1962-1979', startYear: 1962, endYear: 1979, teams: ['Caracas', 'La Guaira'], inningsPitched: '1,178.0', ipValue: 1178.0, era: '2.76', eraValue: 2.76, wins: 64, strikeouts: 578, saves: 21, value: 21, formattedValue: '21' },
          { id: 'p-sv-18', rank: 18, player: 'Luis Peñalver', seasons: '1960-1983', startYear: 1960, endYear: 1983, teams: ['Caracas', 'Zulia', 'Tigres'], inningsPitched: '1,514.1', ipValue: 1514.1, era: '3.07', eraValue: 3.07, wins: 84, strikeouts: 748, saves: 19, value: 19, formattedValue: '19' },
          { id: 'p-sv-19', rank: 19, player: 'Urbano Lugo Sr.', seasons: '1963-1975', startYear: 1963, endYear: 1975, teams: ['La Guaira'], inningsPitched: '912.1', ipValue: 912.1, era: '2.75', eraValue: 2.75, wins: 52, strikeouts: 412, saves: 18, value: 18, formattedValue: '18' },
          { id: 'p-sv-20', rank: 20, player: 'José Bracho', seasons: '1948-1973', startYear: 1948, endYear: 1973, teams: ['Caracas', 'Magallanes', 'Zulia'], inningsPitched: '1,769.2', ipValue: 1769.2, era: '3.17', eraValue: 3.17, wins: 109, strikeouts: 850, saves: 16, value: 16, formattedValue: '16' },
        ];
    }
  }
}
