import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const corsOrigins = configService.get<string[]>('corsOrigins', ['*']);

  // Security Headers via Helmet (configured to allow Swagger UI)
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS securely (never reflect origin with credentials if wildcard)
  const isWildcardCors = corsOrigins.length === 1 && corsOrigins[0] === '*';
  app.enableCors({
    origin: isWildcardCors ? '*' : corsOrigins,
    credentials: isWildcardCors ? false : true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('El Dugout Ve API')
    .setDescription('REST API for El Dugout Ve - Venezuelan Professional Baseball (LVBP) Wiki with PostgreSQL & Google Cloud Run support')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Listen on 0.0.0.0 for Cloud Run compatibility
  await app.listen(port, '0.0.0.0');

  logger.log(`====================================================`);
  logger.log(`🚀 Application running at: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`🩺 Health check probe:   http://localhost:${port}/${apiPrefix}/health`);
  logger.log(`====================================================`);
}

bootstrap();
