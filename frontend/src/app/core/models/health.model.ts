export interface HealthIndicatorDetails {
  status: string;
  [key: string]: any;
}

export interface HealthResponse {
  status: string;
  info?: Record<string, HealthIndicatorDetails>;
  error?: Record<string, HealthIndicatorDetails>;
  details?: Record<string, HealthIndicatorDetails>;
}
