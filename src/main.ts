import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  const corsOrigins = configService.get('CORS_ORIGINS');

  if (corsOrigins) {
    app.enableCors({
      origin: corsOrigins.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    });
  }

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  setupSwagger(app);

  const host = configService.get('APP_HOST') ?? 'localhost';
  const port = configService.get('APP_PORT') ?? 3000;

  await app.listen(port, host);
}
bootstrap();
