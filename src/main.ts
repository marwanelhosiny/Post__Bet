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
import { ValidationExceptionFilter } from './shared/validation-exception.filter';
import * as hbs from 'hbs';
import * as hbsUtils from 'hbs-utils';

// Added the fs import to read certificate and key files
import * as fs from 'fs';


dotenv.config();

async function bootstrap() {

  // Added httpsOptions to specify the paths to the self-signed certificate and key files
  const httpsOptions = {
    key: fs.readFileSync('/etc/ssl/nestjs/ssl-cert-snakeoil.key'),
    cert: fs.readFileSync('/etc/ssl/nestjs/ssl-cert-snakeoil.pem'),
  };

  // Modified the NestFactory.create call to include httpsOptions for HTTPS setup
  const app = await NestFactory.create<NestExpressApplication>(AppModule,
    {
      httpsOptions,
    }
  );

  app.enableCors();

  // app.use(helmet());

  app.use(morgan('dev'));
  app.useGlobalFilters(new ValidationExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  hbs.registerPartials(join(__dirname, '..', 'views/layouts'));
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views/layouts'));
  app.setViewEngine('hbs');
  // app.engine('hbs', hbs({ extname: 'hbs' }));


  //we can change the port in env to 443 if you want the domain to appear without :port after it
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
