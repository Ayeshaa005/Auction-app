import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // CORS_ORIGIN can be a comma-separated list of allowed origins, or "*"
  // (or unset) to reflect any origin. We authenticate with Bearer tokens,
  // not cookies, so allowing any origin is safe and simplifies hosting.
  const corsEnv = process.env.CORS_ORIGIN;
  const corsOrigin =
    !corsEnv || corsEnv === '*'
      ? true
      : corsEnv
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
  app.enableCors({ origin: corsOrigin, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on port ${port} (prefix /api)`);
}
void bootstrap();
