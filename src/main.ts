import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Healthy patients service')
    .setDescription('TODO Description')
    .setVersion('0.0.1')
    .setExternalDoc('Postman Collection', '/api-json')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const theme = new SwaggerTheme();
  const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
  };

  SwaggerModule.setup('api', app, document, options);

  const host = configService.get('APP_HOST') ?? 'localhost';
  const port = configService.get('APP_PORT') ?? 3000;

  await app.listen(port, host);
}
bootstrap();
