import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
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
  /* START CORS Config                                      */
  /* ====================================================== */

  let corsConfig: CorsOptions;

  if (NODE_ENV === 'production') {
    corsConfig = {
      origin: '*',
      methods: 'GET,HEAD,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    };
  } else {
    corsConfig = {
      origin: '*',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    };
  }

  /* ====================================================== */
  /* END CORS Config                                        */
  /* ====================================================== */

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
  app.enableCors(corsConfig);
  await app.listen(PORT);
}
bootstrap();
