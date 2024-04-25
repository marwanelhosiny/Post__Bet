import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePromocodeDto } from '../../dtos/create-promocode.dto';
import { UpdatePromocodeDto } from '../../dtos/update-promocode.dto';
import { Promocode } from '../../entities/promocode.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { UserType } from '../../enums/user-type.enum';

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

  async findAll(req) {
    if(req.user.userType == UserType.ADMIN) {
      return await this.repo.find();
    }
    if(req.user.userType == UserType.USER) {
      return await this.repo.find({where:{isActive: true}});
    }
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
