import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { AddPostDto } from '../../dtos/post.dto';
import { PaymentStatus, UserProgramSubscription } from 'src/entities/subscription.entity';
import * as cron from 'node-cron';

@Injectable()
export class PostingService {

    constructor() {
        // Schedule the cron job in the constructor
        this.scheduleCronJob();
    }

    async createUserProfile(req) {
        try {
            const API_KEY = 'S3CC888-8HJ4DHE-HCNWTZ0-7GEBR21';
            const url = 'https://app.ayrshare.com/api/profiles/profile';
            const data = {
                title: 'ACME Profile'
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response.data);
            // Handle response as needed
        } catch (error) {
            console.error('Error:', error.response.data);
            // Handle error
        }

        // then update user profileKey in db 
    }

    async addPost(req, addPostDto: AddPostDto) {
        // check in request body platformms and if it supported by the user plan

        const userId = req.user.id;
        const subscription = await UserProgramSubscription.findOne({
            where: { user: userId },
            order: { id: 'DESC' },
            relations: ['plan']
        });

        if (subscription.programUsedCounter >= subscription.plan.number_of_posts) {
            throw new HttpException('You have used all your Subscription', HttpStatus.BAD_REQUEST);
        }

        if (!(subscription.plan.limit_number_of_posts_per_day == null)) {
            if (subscription.todayUsedProgramCounter >= subscription.plan.limit_number_of_posts_per_day) {
                throw new HttpException('You have reached your daily posts limits', HttpStatus.BAD_REQUEST);
            }
        }

        if (!subscription) {
            throw new HttpException('User does not have an active subscription', HttpStatus.BAD_REQUEST);
        }

        if (subscription.paymentStatus == PaymentStatus.Pending) {
            throw new HttpException('The subscription is not paid yet', HttpStatus.BAD_REQUEST);
        }

        const endDate = new Date(subscription.startDayPlanSubscribtion);
        endDate.setDate(endDate.getDate() + 30);

        if (new Date() > endDate) {
            throw new HttpException('The Subscription has expired', HttpStatus.BAD_REQUEST);
        }

        await this.checkPlatformSupport(addPostDto.platform, subscription.plan);


        // const response = await this.postToAyrshare(addPostDto, userId);

        subscription.programUsedCounter += 1;
        subscription.todayUsedProgramCounter += 1;
        await subscription.save();

    }

    private async checkPlatformSupport(platform: { platform: string, isSelected: boolean }[], plan: any) {
        for (const item of platform) {
            if (item.isSelected && plan[item.platform] === false) {
                throw new HttpException(`${item.platform} is not supported by your subscription plan`, HttpStatus.BAD_REQUEST);
            }
        }
    }

    async postToAyrshare(addPostDto: AddPostDto, userId: string) {
        const API_KEY = ''; // Replace with your Ayrshare API key
        const url = 'https://app.ayrshare.com/api/post';
        const data = {
            ...addPostDto,
            profileKey: '', // Use the user ID to get profileKey
        };

        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    }

    private scheduleCronJob() {
        cron.schedule('0 0 * * *', async () => {
            await UserProgramSubscription.update({}, { todayUsedProgramCounter: 0 });
            console.log('todayUsedProgramCounter reset to zero successfully.');

        });
    }
}
// */2 * * * *