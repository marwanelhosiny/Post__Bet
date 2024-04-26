import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { ContactUs } from '../../entities/contact-us.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs])],
  controllers: [ContactUsController],
  providers: [ContactUsService]
})
export class ContactUsModule {}
