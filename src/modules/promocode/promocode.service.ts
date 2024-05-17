import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePromocodeDto } from '../../dtos/create-promocode.dto';
import { UpdatePromocodeDto } from '../../dtos/update-promocode.dto';
import { Promocode } from '../../entities/promocode.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Like, ILike } from 'typeorm';
import { UserType } from '../../enums/user-type.enum';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Plan } from 'src/entities/plan.entity';

@Injectable()
export class PromocodeService {

  constructor(
    @InjectRepository(Promocode) private readonly repo: Repository<Promocode>
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
    try {
      const entityToRemove = await this.repo.findOne({ where: { id } });
      if (!entityToRemove) {
        throw new Error('Entity not found');
      }
      await this.repo.remove(entityToRemove);
      return 'Entity deleted successfully';
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('violates foreign key constraint')) {
        throw new HttpException('Cannot delete promocode because it is associated with one or more user program subscriptions', HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async checkPromoCode(promoCode: string, planId: number) {
    const promo = await this.repo.findOne({ where: { promoCode: promoCode } });
    if (!promo) {
      throw new HttpException('Promo code not found', HttpStatus.BAD_REQUEST);
    }
    if (promo.isActive == false){
      throw new HttpException('This Promo code is not active', HttpStatus.BAD_REQUEST);
    }

    const plan = await Plan.findOne({ where:{id: planId} });
    if (!plan) {
      throw new HttpException('Plan not found', HttpStatus.BAD_REQUEST)
    }
    if(plan.isActive == false){
      throw new HttpException('This Plan is not active', HttpStatus.BAD_REQUEST);
    }

    const discount  = (promo.percentage / 100 ) * plan.price
    const priceAfterDiscount = plan.price - discount
    const vatAndTaxes = priceAfterDiscount * (plan.vat / 100)
    const totalPaid = priceAfterDiscount + vatAndTaxes

    return {
      'Promo Code Percentage': promo.percentage,
      'Plan Price': plan.price,
      'Discount' : discount,
      'Price after discount': priceAfterDiscount,
      'Vat and taxes Percentage' : plan.vat,
      'Vat and Taxes': vatAndTaxes,
      'Total Paid': totalPaid
    }
  }
}
