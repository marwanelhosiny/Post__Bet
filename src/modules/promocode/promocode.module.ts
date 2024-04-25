import { Module } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { PromocodeController } from './promocode.controller';
import { Promocode } from '../../entities/promocode.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Promocode])],
  controllers: [PromocodeController],
  providers: [PromocodeService]
})
export class PromocodeModule {}
