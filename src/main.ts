// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// Ya no necesitas importar rateLimit ni Request/Response aquí para esto

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // QUITA ESTA SECCIÓN: app.use('/auth/login', rateLimit(...));

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();