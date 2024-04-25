import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { FileModule } from './modules/file/file.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { MailModule } from './modules/mail/mail.module';
import { PostingModule } from './modules/posting/posting.module';
import { PromocodeModule } from './modules/promocode/promocode.module';
import { PlansModule } from './modules/plans/plans.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ResponseInterceptor } from './shared/response.interceptor';


const AllModules = [
  UserModule,
  AuthModule,
  // FileModule,
  MailModule,
  PostingModule,
  PromocodeModule,
  PlansModule,
  ContactUsModule
]

// const path = `./${process.env.NODE_ENV}.env`
// const path = `./.env`
// let con = dotenv.configDotenv({
//   path
// })
// process.env = {
//   ...process.env,
//   ...con.parsed
// }




@Module({
  imports: [
    // ScheduleModule.forRoot(),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),

    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      // envFilePath: path,
      // // load: [configuration],
      isGlobal: true,
    }),



    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: process.env.DB_HOST,
      // port: +process.env.DB_PORT,
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB_NAME,
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
      logging: false,
      logger: 'advanced-console'
    }),

    ...AllModules,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})


export class AppModule {
}
