import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePromocodeDto } from '../../dtos/create-promocode.dto';
import { UpdatePromocodeDto } from '../../dtos/update-promocode.dto';
import { Promocode } from 'src/entities/promocode.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

@Injectable()
export class PromocodeService {
  constructor(
    @InjectRepository(Promocode) private readonly repo: Repository<Promocode>,
  ) { }

  async create(createPromocodeDto: CreatePromocodeDto) {
    try {
      await this.repo.save(createPromocodeDto);
      return "Promo Code created successfully";
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('UQ_0a7f5406636c063ad71ac4b0aac')) {
        throw new HttpException('Promo code of this name already exists', HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async update(id: number, updatePromocodeDto: UpdatePromocodeDto) {
    await this.repo.update(id, updatePromocodeDto);
    return "Promo Code updated successfully";
  }

  async remove(id: number) {
    const entityToRemove = await this.repo.findOne({ where: { id } });
    if (!entityToRemove) {
      throw new Error('Entity not found');
    }
    await this.repo.remove(entityToRemove);
    return 'Entity deleted successfully';
  }
}
