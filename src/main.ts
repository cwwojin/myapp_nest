import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';
  const PORT = 3000;

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
