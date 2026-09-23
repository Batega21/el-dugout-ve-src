import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricalRecordDto } from '../models/record.model';

@Injectable({
  providedIn: 'root',
})
export class RecordsService {
  private readonly http = inject(HttpClient);

  /**
   * Retrieves all-time historical milestones and records of the LVBP.
   */
  getHistoricalMilestones(): Observable<HistoricalRecordDto[]> {
    return this.http.get<HistoricalRecordDto[]>('v1/records/historical-milestones');
  }
}
