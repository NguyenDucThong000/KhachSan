import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const allowedOrigins = new Set(
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [],
  );
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:5173');
  }
  app.enableCors({
    origin: [...allowedOrigins],
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
