import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { BaseDocumentBuilder } from './utils/swagger/document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';
  const PORT = 3000;

  /* ====================================================== */
  /* START Swagger Setup                                    */
  /* ====================================================== */

  const documentBuilder = new BaseDocumentBuilder();
  const document = SwaggerModule.createDocument(
    app,
    documentBuilder.initOptions(),
  );
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
