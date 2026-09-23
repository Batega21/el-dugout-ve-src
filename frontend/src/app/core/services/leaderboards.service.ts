import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ImportResult,
  LeaderQueryResponse,
  StatCategory,
} from '../models/leaderboard.model';
import { StatRecordItem } from '../../shared/components/stats-strip/stats-strip.interface';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardsService {
  private readonly http = inject(HttpClient);

  /**
   * Upload multiple Excel files with upload progress tracking events.
   */
  uploadFiles(files: File[]): Observable<HttpEvent<ImportResult>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }

    return this.http.post<ImportResult>('leaderboards/import', formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Retrieve historical leader records with optional category and season filters.
   */
  getLeaders(
    category?: StatCategory,
    season?: string,
    limit: number = 50,
    offset: number = 0,
  ): Observable<LeaderQueryResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (category) {
      params = params.set('category', category);
    }
    if (season) {
      params = params.set('season', season);
    }

    return this.http.get<LeaderQueryResponse>('leaderboards/leaders', { params });
  }

  /**
   * Retrieve top historical LVBP records for the stats strip marquee ticker.
   */
  getTopRecords(): Observable<StatRecordItem[]> {
    return this.http.get<StatRecordItem[]>('leaderboards/top-records');
  }

  /**
   * Client-side preview of the statistical category inferred from the file name.
   */
  detectCategoryPreview(fileName: string): { label: string; category: StatCategory | 'UNKNOWN' } {
    const lower = fileName.toLowerCase();
    if (lower.includes('bate') || lower.includes('avg')) {
      return { label: 'Batting Average', category: 'BATTING_AVERAGE' };
    }
    if (lower.includes('homerun') || lower.includes('jonron') || lower.includes('hr')) {
      return { label: 'Home Runs', category: 'HOME_RUNS' };
    }
    if (lower.includes('doble') || lower.includes('2b')) {
      return { label: 'Doubles', category: 'DOUBLES' };
    }
    if (lower.includes('triple') || lower.includes('3b')) {
      return { label: 'Triples', category: 'TRIPLES' };
    }
    if (lower.includes('hit') || lower.includes('imparable')) {
      return { label: 'Hits', category: 'HITS' };
    }
    if (lower.includes('anotada') || lower.includes('carrera') || lower.includes('runs')) {
      return { label: 'Runs Scored', category: 'RUNS' };
    }
    if (lower.includes('inning') || lower.includes('entrada') || lower.includes('ip') || lower.includes('el')) {
      return { label: 'Innings Pitched', category: 'INNINGS_PITCHED' };
    }
    return { label: 'Excel Dataset', category: 'UNKNOWN' };
  }
}
