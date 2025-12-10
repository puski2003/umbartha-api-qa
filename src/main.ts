import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle(' Umbartha Admin Portal & Web API')
    .setDescription(
      'Welcome to the Umbartha Admin Portal & Web API, the central hub for counselors associated with Umbartha Counseling Center. Leveraging NestJS and Auth0, we ensure robust authentication and authorization mechanisms, safeguarding sensitive information and granting access only to authorized personnel. Additionally, our integration with AWS services such as S3 for file storage and SES for email communication ensures seamless data management and communication channels. With support for SMS and OTP handling via a dedicated shoutout service,',
    )
    .setVersion('1.0.0')
    .addTag('Umbartha')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);

  Logger.debug(
    `Application is running on : ${await app.getUrl()}`,
    'Umbartha-API',
  );
}
bootstrap();
