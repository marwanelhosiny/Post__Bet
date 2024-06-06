import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { AddPostDto } from '../../dtos/post.dto';
import { PaymentStatus, UserProgramSubscription } from '../../entities/subscription.entity';
import * as cron from 'node-cron';
import { User } from '../../entities/user.entity';

@Injectable()
export class PostingService {

    constructor() {
        // Schedule the cron job in the constructor
        this.scheduleCronJob();
    }

    async createUserProfile(user) {
        try {
            // const API_KEY = process.env.AYRSHARE_API_KEY;
            const API_KEY = "TH8S6RT-67ZMT2F-HTB3ZSH-PFEAPER";
            const url = 'https://app.ayrshare.com/api/profiles/profile';
            const data = {
                // title: req.user.email
                title: user.email
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error:', error.response.data);
            throw error;
        }
    }

    async addPost(subscriptionId: number, req, addPostDto: AddPostDto) {

        const userId = req.user.id;
        // const subscription = await UserProgramSubscription.findOne({
        //     where: { id: subscriptionId },
        //     // order: { id: 'DESC' },
        //     // relations: ['plan']
        // });

        const subscription = await UserProgramSubscription.createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .leftJoinAndSelect('subscription.user', 'user')
            .where('subscription.id = :subscriptionId', { subscriptionId })
            // .andWhere('subscription.planId = :planId', { planId })
            // .orderBy('subscription.id', 'DESC')
            .getOne();

        if (!subscription) {
            throw new HttpException('User does not have an active subscription', HttpStatus.BAD_REQUEST);
        }

        if (subscription.user.id != req.user.id) {
            throw new HttpException('User Mismatch', HttpStatus.BAD_REQUEST);
        }

        const today = new Date();
        const thirtyDaysLater = new Date(subscription.startDayPlanSubscription);
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        if (today > thirtyDaysLater) {
            throw new HttpException('Subscription is not active', HttpStatus.BAD_REQUEST);
        }

        // if (subscription.planUsedCounter >= subscription.plan.number_of_posts) {
        //     throw new HttpException('You have used all your Subscription', HttpStatus.BAD_REQUEST);
        // }

        if (!(subscription.plan.number_of_posts == null)) {
            if (subscription.planUsedCounter >= subscription.plan.number_of_posts) {
                throw new HttpException('You have used all your Subscription', HttpStatus.BAD_REQUEST);
            }
        }

        if (!(subscription.plan.limit_number_of_posts_per_day == null)) {
            if (subscription.todayUsedPlanCounter >= subscription.plan.limit_number_of_posts_per_day) {
                throw new HttpException('You have reached your daily posts limits', HttpStatus.BAD_REQUEST);
            }
        }

        if (subscription.paymentStatus == PaymentStatus.Pending) {
            throw new HttpException('The subscription is not paid yet', HttpStatus.BAD_REQUEST);
        }

        const endDate = new Date(subscription.startDayPlanSubscription);
        endDate.setDate(endDate.getDate() + 30);

        if (new Date() > endDate) {
            throw new HttpException('The Subscription has expired', HttpStatus.BAD_REQUEST);
        }

        await this.checkPlatformSupport(addPostDto.platform, subscription.plan);


        const response = await this.postToAyrshare(addPostDto, req);

        subscription.planUsedCounter += 1;
        subscription.todayUsedPlanCounter += 1;
        await subscription.save();

    }

    private async checkPlatformSupport(platform: { platform: string, isSelected: boolean }[], plan: any) {
        for (const item of platform) {
            if (item.isSelected && plan[item.platform] === false) {
                throw new HttpException(`${item.platform} is not supported by your subscription plan`, HttpStatus.BAD_REQUEST);
            }
        }
    }

    async postToAyrshare(addPostDto: AddPostDto, req) {
        // const API_KEY = process.env.AYRSHARE_API_KEY;
        const API_KEY = "TH8S6RT-67ZMT2F-HTB3ZSH-PFEAPER";
        const PROFILE_KEY = (await User.findOne({ where: { id: req.user.id } })).profileKey;
        const url = 'https://app.ayrshare.com/api/post';

        try {
            const data = {
                post: addPostDto.post,
                mediaUrls: addPostDto.mediaUrls,
                platforms: addPostDto.platform.map(item => item.platform.toLowerCase()),
                faceBookOptions: addPostDto.faceBookOptions,
                instagramOptions: addPostDto.instagramOptions,
                isVideo: addPostDto.isVideo,
                youTubeOptions: addPostDto.youTubeOptions
            };

            console.log('afnrkejjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjs',url,data)

            const response = await axios.post(url, JSON.stringify(data), {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Profile-Key': PROFILE_KEY
                }
            });

            

            return response.data;
        } catch (error) {
            console.error('Error from Ayrshare:', error.response ? error.response.data : error.message);

            if (error.response) {
                // Ayrshare API errors
                const errorMessage = error.response.data.errors ? error.response.data.errors[0].message : 'Unknown error';
                const statusCode = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
                throw new HttpException({
                    status: statusCode,
                    error: errorMessage,
                    details: error.response.data
                }, statusCode);
            } else {
                // Other errors (e.g., network issues)
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'An error occurred while processing your request.',
                    details: error.message
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }










    private scheduleCronJob() {
        cron.schedule('0 0 * * *', async () => {
            await UserProgramSubscription.update({}, { todayUsedPlanCounter: 0 });
            console.log('todayUsedPlanCounter reset to zero successfully.');

        });
    }
}
// */2 * * * *