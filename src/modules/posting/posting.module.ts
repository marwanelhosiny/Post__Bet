import { Module } from '@nestjs/common';
import { PostingService } from './posting.service';
import { PostingController } from './posting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'src/entities/banner.entity';

@Module({
  controllers: [PostingController],
  providers: [PostingService],
  imports: [
    TypeOrmModule.forFeature([Banner]), // Register the Banner entity here
  ],
})
export class PostingModule {}
