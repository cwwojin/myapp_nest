import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';
  const PORT = 3000;

  /* ====================================================== */
  /* START Swagger Setup                                    */
  /* ====================================================== */

  const config = new DocumentBuilder()
    .setTitle('URL Shortener App - Backend')
    .setDescription('The URL Shortener Backend - API Description')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  /* ====================================================== */
  /* END Swagger Setup                                      */
  /* ====================================================== */

  // Log environment
  console.log('======================');
  console.log(NODE_ENV);
  console.log('======================');

  // Log config
  console.log(configService);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
}
bootstrap();
