import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlanDto } from '../../dtos/create-plan.dto';
import { UpdatePlanDto } from '../../dtos/update-plan.dto';
import { Plan } from '../../entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Like, QueryFailedError, Repository } from 'typeorm';
import { UserType } from '../../enums/user-type.enum';
import { PaymentStatus, UserProgramSubscription } from '../../entities/subscription.entity';
import { PlanSubscripeDto } from '../../dtos/plan-subscripe.dto';
import { Promocode } from '../../entities/promocode.entity';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import axios, { AxiosError } from 'axios';
import { UserService } from '../user/user.service';
import { PostingService } from '../posting/posting.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PlansService {

  constructor(
    @InjectRepository(Plan) private readonly repo: Repository<Plan>,
    public postingService: PostingService,
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
  
    const paginateOptions: FindManyOptions<Plan> = {
      where: whereClause,
      order: { price: 'ASC' }
    };
  
    if (req.user.userType === UserType.ADMIN) {
      return paginate<Plan>(this.repo, options, paginateOptions);
    }
  
    if (req.user.userType === UserType.USER) {
      whereClause = { ...whereClause, isActive: true };
      paginateOptions.where = whereClause;
      return paginate<Plan>(this.repo, options, paginateOptions);
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
    try {
      const entityToRemove = await this.repo.findOne({ where: { id } });
      if (!entityToRemove) {
        throw new Error('Entity not found');
      }
      await this.repo.remove(entityToRemove);
      return 'Entity deleted successfully';
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('violates foreign key constraint')) {
        throw new HttpException('Cannot delete plan because it is associated with one or more user program subscriptions', HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
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
      await subscription.save();
      return { message: 'Plan subscribed successfully.' };
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


  async confirmPayment(chargeId: string, req): Promise<any> {
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
        await UserProgramSubscription.update({ chargeId: chargeId }, { paymentStatus: PaymentStatus.Paid })
      }

      if (responseData && responseData.status === 'INITIATED') {
        console.log('Payment Still Pending');
        await UserProgramSubscription.update({ chargeId: chargeId }, { paymentStatus: PaymentStatus.Pending })
      }

      // const profileKey =  (await User.findOne({where:{id : req.user.id}})).profileKey
      // if (!profileKey){
      //   await this.postingService.createUserProfile(req)
      // }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        if (axiosError.response && axiosError.response.status === 400) {
          throw new HttpException(`Invalid charge ID: ${chargeId}`, HttpStatus.BAD_REQUEST);
        }
      }
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
      .addSelect('subscription.chargeId')
      .addSelect('subscription.transactionUrl')
      .addSelect('subscription.paymentStatus')
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



  async getAllSubscription(page: number, pageSize: number, paymentStatus?: string): Promise<Pagination<UserProgramSubscription>> {
    page = page || 1;
    pageSize = pageSize || 100;
    
    const queryBuilder = UserProgramSubscription
      .createQueryBuilder('subscription')
      .orderBy('subscription.id', 'DESC')
      .leftJoin('subscription.plan', 'plan')
      .leftJoin('subscription.user', 'user')
      .leftJoin('subscription.promocode', 'promocode')
      .addSelect('plan.id')
      .addSelect('user.id')
      .addSelect('user.email')
      .addSelect('promocode.id')
      .addSelect('promocode.promoCode');

    if (paymentStatus) {
      queryBuilder.andWhere('subscription.paymentStatus = :paymentStatus', { paymentStatus });
    }

    const pagination = await paginate<UserProgramSubscription>(queryBuilder, { page, limit: pageSize });
    return pagination;
  }
  
  
}
