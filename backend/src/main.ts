import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { ValidateInputPipe } from './pipe/validate.pipe';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  // enable validation globally
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // User input validation globally
  app.useGlobalPipes(new ValidateInputPipe());

  // Response mapping
  app.useGlobalInterceptors(new TransformInterceptor());

  // Enable CORS
  // Enable CORS with sensible defaults. Accept a comma-separated list in FRONTEND_ORIGINS
  // or a single origin in FRONTEND_ORIGIN. If neither is set, reflect origin (allow all)
  const frontendOriginsEnv = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN
  const origins = frontendOriginsEnv
    ? frontendOriginsEnv.split(',').map((s) => s.trim()).filter(Boolean)
    : true

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })

  // Swagger / OpenAPI setup (enabled except in production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Insignia API')
      .setDescription('Insignia API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log(`Swagger docs available at http://localhost:${process.env.PORT || 3000}/api/docs`);
  }
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Listening on http://localhost:${port}`);
}
bootstrap();
