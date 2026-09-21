export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'free' | 'basic' | 'premium';
export type SubscriptionTier = 'FREE' | 'BASIC' | 'PREMIUM';
export type BillingPeriod = 'MONTHLY' | 'ANNUAL' | 'monthly' | 'annual';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export interface CreateSubscriptionInput {
  plan?: SubscriptionPlan;
  billingPeriod?: BillingPeriod;
  renewalConsent?: boolean;
  termsAccepted?: boolean;
}

export interface Subscription {
  id: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM';
  billingPeriod: 'MONTHLY' | 'ANNUAL';
  renewalConsent: boolean;
  termsAccepted: boolean;
  status: SubscriptionStatus;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    mobileNumber?: string | null;
    name?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

