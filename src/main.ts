import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { HttpExceptionFilter } from './shared/global-exception';
// import * as hbs from 'express-handlebars';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import { ValidationExceptionFilter } from './shared/validation-exception.filter';


dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  // app.use(helmet());

  app.use(morgan('dev'));
  app.useGlobalFilters(new ValidationExceptionFilter());

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public' })
  // app.engine('hbs', hbs({ extname: 'hbs' }));

  app.setViewEngine('hbs');

  const PORT = process.env.PORT || 8080;

  const options = new DocumentBuilder()
    .setTitle('Postbet')
    .setDescription('This is a new version of Postbet')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document)

  await app.listen(PORT, '0.0.0.0', () => {
    Logger.log(`PostBet server started at ${PORT}`, 'server');
    Logger.log(`DB connected on ${process.env.DB_HOST}`, 'DataBase')
    Logger.log(`http://localhost:${PORT}/api`, "swagger")
  });
}

bootstrap();
