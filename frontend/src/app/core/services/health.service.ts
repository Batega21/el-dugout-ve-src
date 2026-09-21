import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { HealthResponse } from '../models/health.model';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly http = inject(HttpClient);

  getHealth(): Observable<HealthResponse | null> {
    return this.http.get<HealthResponse>('health').pipe(
      catchError((err) => {
        console.warn('Backend health check returned error:', err);
        return of(null);
      }),
    );
  }
}
