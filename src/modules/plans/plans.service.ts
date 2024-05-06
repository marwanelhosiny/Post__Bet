import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlanDto } from '../../dtos/create-plan.dto';
import { UpdatePlanDto } from '../../dtos/update-plan.dto';
import { Plan } from '../../entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { UserType } from '../../enums/user-type.enum';
import { PaymentStatus, UserProgramSubscription } from '../../entities/subscription.entity';
import { PlanSubscripeDto } from '../../dtos/plan-subscripe.dto';
import { Promocode } from '../../entities/promocode.entity';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import axios, { AxiosError } from 'axios';

@Injectable()
export class PlansService {
  


  constructor(
    @InjectRepository(Plan) private readonly repo: Repository<Plan>,
  ) { }

  async create(createPlanDto: CreatePlanDto) {
    await this.repo.save(createPlanDto);
    return "Plan created successfully";
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
        name: (search.length > 0) ? ILike(`%${search}%`) : undefined
      };
    }
    if (req.user.userType === UserType.ADMIN) {
      return paginate<Plan>(this.repo, options, { where: whereClause });
    }
    if (req.user.userType === UserType.USER) {
      whereClause = { ...whereClause, isActive: true };
      return paginate<Plan>(this.repo, options, { where: whereClause });
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

    let transactionUrl: string;
    let chargeId: string;

    if (plan.isFree) {
      subscription.paymentStatus = PaymentStatus.Free;
    }

    if (promocode) {
      promocode.usedCounter++;
      await promocode.save();
    }

    const chargeResponse = await this.createCharge(finalPrice, req.user);
    transactionUrl = chargeResponse.transaction.url;
    chargeId = chargeResponse.id;

    subscription.transactionUrl = transactionUrl;
    subscription.chargeId = chargeId;

    await subscription.save();

    return { transactionUrl, chargeId };
  }

  async createCharge(finalPrice, user) {
    const data = {
      amount: finalPrice,
      currency: 'AED',
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: 'Test Description',
      metadata: {
        udf1: 'Metadata 1'
      },
      reference: {
        transaction: 'txn_01',
        order: 'ord_01'
      },
      receipt: {
        email: true,
        sms: true
      },
      customer: {
        first_name: user.name,
        middle_name: '',
        last_name: '',
        email: user.email,
        // phone: {
        //   country_code: 965,
        //   number: 51234567
        // }
      },
      merchant: {
        id: process.env.MERCHANT_ID,
      },
      source: {
        id: 'src_all'
      },
      post: {
        url: 'https://www.google.com/'
      },
      redirect: {
        url: 'https://www.google.com/'
      }
    };

    const headers = {
      Authorization: process.env.SK_TEST,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post('https://api.tap.company/v2/charges/', data, {
        headers: headers
      });
      console.log('Charge request successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error making charge request:', error.message);
      throw error;
    }
  }

  async confirmPayment(chargeId: string): Promise<any> {
    const headers = {
      Authorization: process.env.SK_TEST,
      Accept: 'application/json'
    };

    try {
      const response = await axios.get(`https://api.tap.company/v2/charges/${chargeId}`, {
        headers: headers
      });

      const responseData = response.data;

      if (responseData && responseData.status === 'CAPTURED') {
        console.log('Payment Done already');
        await UserProgramSubscription.update({chargeId: chargeId}, {paymentStatus: PaymentStatus.Paid})
      }

      else if (responseData && responseData.status === 'INITIATED') {
        console.log('Payment Still Pending');
        await UserProgramSubscription.update({chargeId: chargeId}, {paymentStatus: PaymentStatus.Pending})
      }

      return response.data;
    } catch (error) {if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      if (axiosError.response && axiosError.response.status === 400) {
        throw new HttpException(`Invalid charge ID: ${chargeId}`, HttpStatus.BAD_REQUEST);
      }
    }
    throw error;
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
