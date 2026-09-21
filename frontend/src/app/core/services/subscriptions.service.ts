import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription, CreateSubscriptionInput } from '../models/subscription.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionsService {
  private readonly http = inject(HttpClient);

  getSubscriptions(email?: string): Observable<Subscription[]> {
    return this.http.get<Subscription[]>('subscriptions', {
      params: email ? { email } : {},
    });
  }

  getSubscription(id: string): Observable<Subscription> {
    return this.http.get<Subscription>(`subscriptions/${id}`);
  }

  createSubscription(input: CreateSubscriptionInput): Observable<Subscription> {
    return this.http.post<Subscription>('subscriptions', input);
  }
}
