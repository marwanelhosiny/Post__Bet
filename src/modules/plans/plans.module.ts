import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '../../entities/plan.entity';
import { PostingService } from '../posting/posting.service';
import { PostingModule } from '../posting/posting.module';
import { Banner } from 'src/entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan , Banner])],
  controllers: [PlansController],
  providers: [PlansService, PostingService]
})
export class PlansModule {}
