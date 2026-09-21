export interface AppConfig {
  nodeEnv: string;
  port: number;
  appName: string;
  apiPrefix: string;
  corsOrigins: string[];
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  appName: process.env.APP_NAME || 'El Dugout Ve',
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:4200,http://localhost:8080,https://eldugoutve.com,https://www.eldugoutve.com')
    .split(',')
    .map((origin) => origin.trim()),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-prod',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
});

