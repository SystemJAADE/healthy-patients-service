import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export function setupSwagger(app: INestApplication, port: number): void {
  // Leer el archivo openapi.json
  const openApiPath = path.join(__dirname, '../../../openapi.json');

  const openapiDocument = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
  // Tema oscuro para swagger
  const theme = new SwaggerTheme();
  const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
  };
  // Generar la documentación usando el archivo JSON
  SwaggerModule.setup('/api/v1/api-docs', app, openapiDocument, options);

  // Crear una ruta para servir el archivo JSON
  app.getHttpAdapter().get('/api/v1/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openapiDocument);
  });

  console.log(
    `📓 Versión 1 Docs are available at http://localhost:${port}/api/v1/api-docs`,
  );
}
