import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePromocodeDto } from '../../dtos/create-promocode.dto';
import { UpdatePromocodeDto } from '../../dtos/update-promocode.dto';
import { Promocode } from '../../entities/promocode.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Like, ILike } from 'typeorm';
import { UserType } from '../../enums/user-type.enum';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';

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
      if (error instanceof QueryFailedError && error.message.includes('UQ_b01497d884dc9a1782ec6b60b5')) {
        throw new HttpException('Promo code of this name already exists', HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findAll(req, page, pageSize, search) {
    const options: IPaginationOptions = {
      page: page,
      limit: pageSize
    };
    let whereClause = {};
    if (search) {
      whereClause = {
        ...whereClause,
        promoCode: (search.length > 0) ? ILike(`%${search}%`) : undefined
      };
    }
    if (req.user.userType === UserType.ADMIN) {
      return paginate<Promocode>(this.repo, options, { where: whereClause });
    }
    if (req.user.userType === UserType.USER) {
      whereClause = { ...whereClause, isActive: true };
      return paginate<Promocode>(this.repo, options, { where: whereClause });
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
