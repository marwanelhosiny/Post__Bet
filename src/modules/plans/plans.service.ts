import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlanDto } from '../../dtos/create-plan.dto';
import { UpdatePlanDto } from '../../dtos/update-plan.dto';
import { Plan } from '../../entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from '../../enums/user-type.enum';
import { PaymentStatus, UserProgramSubscription } from '../../entities/subscription.entity';
import { PlanSubscripeDto } from '../../dtos/plan-subscripe.dto';
import { Promocode } from 'src/entities/promocode.entity';

@Injectable()
export class PlansService {


  constructor(
    @InjectRepository(Plan) private readonly repo: Repository<Plan>,
  ) { }

  async create(createPlanDto: CreatePlanDto) {
    await this.repo.save(createPlanDto);
    return "Plan created successfully";
  }

  async findAll(req) {
    if (req.user.userType == UserType.ADMIN) {
      return await this.repo.find();
    }
    if (req.user.userType == UserType.USER) {
      return await this.repo.find({ where: { isActive: true } });
    }
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    await this.repo.update(id, updatePlanDto);
    return "Plan updated successfully";
  }

  async remove(id: number) {
    const entityToRemove = await this.repo.findOne({ where: { id } });
    if (!entityToRemove) {
      throw new Error('Entity not found');
    }
    await this.repo.remove(entityToRemove);
    return 'Entity deleted successfully';
  }

  async makeSubscription(planSubscripeDto: PlanSubscripeDto, req) {
    const plan = await Plan.findOne({ where: { id: planSubscripeDto.planId } });
    if (!plan) {
      throw new HttpException('No Plan By this Id', HttpStatus.BAD_REQUEST);
    }
    if (!plan.isActive) {
      throw new HttpException('This Plan is not Active', HttpStatus.BAD_REQUEST);
    }

    let promocode = null;
    if (planSubscripeDto.promoCode) {
      promocode = await Promocode.findOne({ where: { promoCode: planSubscripeDto.promoCode } });
      if (!promocode) {
        throw new HttpException('This Promo code does not exist', HttpStatus.BAD_REQUEST);
      }
      if (!promocode.isActive) {
        throw new HttpException('This Promo code is not Active', HttpStatus.BAD_REQUEST);
      }
    }

    let discount = 0;
    if (promocode) {
      discount = (promocode.percentage / 100) * plan.price;
    }

    const vatAmount = (plan.vat / 100) * (plan.price - discount)
    const finalPrice = plan.price - discount + vatAmount;

    const subscription = new UserProgramSubscription();
    subscription.totalPrice = plan.price;
    subscription.discount = discount;
    subscription.vatAmount = vatAmount;
    subscription.finalPrice = finalPrice;
    subscription.startDayPlanSubscription = new Date();
    subscription.promocode = promocode;
    subscription.user = req.user;
    subscription.plan = plan;
    if (plan.isFree) {
      subscription.paymentStatus = PaymentStatus.Free;
    }
    await subscription.save();

    if (promocode) {
      promocode.usedCounter++;
      await promocode.save();
    }
  }



  async mySubscribtion(req: any) {
    const today = new Date();
    const userId = req.user.id;
    return await UserProgramSubscription
      .createQueryBuilder('subscription')
      .leftJoin('subscription.plan', 'plan')
      .leftJoin('subscription.user', 'user')
      .where('subscription.user = :userId', { userId })
      .orderBy('subscription.id', 'ASC')
      .select('subscription.id')
      .addSelect('subscription.startDayPlanSubscription')
      .addSelect('subscription.planUsedCounter')
      .addSelect('subscription.todayUsedPlanCounter')
      .addSelect('plan.name')
      .addSelect('plan.details')
      .addSelect('plan.number_of_posts')
      .addSelect('plan.limit_number_of_posts_per_day')
      .addSelect('plan.Facebook')
      .addSelect('plan.Instagram')
      .addSelect('plan.LinkedIn')
      .addSelect('plan.Twitter')
      .addSelect('plan.Telegram')
      .addSelect('plan.TikTok')
      .addSelect('plan.Pinterest')
      .addSelect('plan.Reddit')
      .getMany()
  }
}
