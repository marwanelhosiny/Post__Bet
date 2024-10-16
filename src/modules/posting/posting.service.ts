import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { AddPostDto } from '../../dtos/post.dto';
import { PaymentStatus, UserProgramSubscription } from '../../entities/subscription.entity';
import * as cron from 'node-cron';
import { User } from '../../entities/user.entity';
import {  Banner } from '../../entities/banner.entity'
import * as fs from 'node:fs';
import * as path from 'path';
import * as FormData from 'form-data'
import * as slugify from 'slugify'
import * as sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';



@Injectable()
export class PostingService {

    constructor(

        @InjectRepository(Banner)
        private readonly bannerRepository: Repository<Banner>

    ) {
        // Schedule the cron job in the constructor
        this.scheduleCronJob();
    }

    async createUserProfile(user) {
        try {
            const API_KEY = "TH8S6RT-67ZMT2F-HTB3ZSH-PFEAPER";
            const url = 'https://app.ayrshare.com/api/profiles/profile';
            const data = {
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

        const subscription = await UserProgramSubscription.createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .leftJoinAndSelect('subscription.user', 'user')
            .where('subscription.id = :subscriptionId', { subscriptionId })
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

        return response;
    }

    private async checkPlatformSupport(platform: { platform: string, isSelected: boolean }[], plan: any) {
        for (const item of platform) {
            if (item.isSelected && plan[item.platform] === false) {
                throw new HttpException(`${item.platform} is not supported by your subscription plan`, HttpStatus.BAD_REQUEST);
            }
        }
    }

    async postToAyrshare(addPostDto: AddPostDto, req, scheduleDate?: string) {
        const API_KEY = "TH8S6RT-67ZMT2F-HTB3ZSH-PFEAPER";
        const PROFILE_KEY = (await User.findOne({ where: { id: req.user.id } })).profileKey;
        const url = 'https://app.ayrshare.com/api/post';

        try {
            const data: any = {
                post: addPostDto.post,
                mediaUrls: addPostDto.mediaUrls,
                platforms: addPostDto.platform.map(item => item.platform.toLowerCase()),
                faceBookOptions: addPostDto.faceBookOptions,
                instagramOptions: addPostDto.instagramOptions,
                isVideo: addPostDto.isVideo,
                youTubeOptions: addPostDto.youTubeOptions,
                redditOptions: addPostDto.redditOptions
            };

            if (scheduleDate) {
                data.scheduleDate = scheduleDate;
            }

            console.log('afnrkejjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjs', url, data);

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
                const errorMessage = error.response.data.errors ? error.response.data.errors[0].message : 'Unknown error';
                const statusCode = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
                throw new HttpException({
                    status: statusCode,
                    error: errorMessage,
                    details: error.response.data
                }, statusCode);
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'An error occurred while processing your request.',
                    details: error.message
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async schedulePost(subscriptionId: number, req, addPostDto: AddPostDto, scheduleDate: string) {
        const userId = req.user.id;

        const subscription = await UserProgramSubscription.createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .leftJoinAndSelect('subscription.user', 'user')
            .where('subscription.id = :subscriptionId', { subscriptionId })
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

        const response = await this.postToAyrshare(addPostDto, req, scheduleDate);

        subscription.planUsedCounter += 1;
        subscription.todayUsedPlanCounter += 1;
        await subscription.save();

        return response;
    }

    async getPostHistory(req: any, transformedParams: any) {
        const API_KEY = "TH8S6RT-67ZMT2F-HTB3ZSH-PFEAPER";
        const PROFILE_KEY = (await User.findOne({ where: { id: req.user.id } })).profileKey;
        const url = 'https://app.ayrshare.com/api/history';

        try {
            // Prepare the params object
            const params: any = {
                status: transformedParams.status,
                lastDays: transformedParams.lastDays,
                limit: transformedParams.limit,
                type: transformedParams.type,
                objResponse: transformedParams.objResponse
            };

            // Handle platform parameter correctly
            if (transformedParams.platform) {
                params.platform = transformedParams.platform.join(',');
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Profile-Key': PROFILE_KEY
                },
                params: params
            });

            return response.data;
        } catch (error) {
            console.error('Error from Ayrshare:', error.response ? error.response.data : error.message);

            if (error.response) {
                const errorMessage = error.response.data.errors ? error.response.data.errors[0].message : 'Unknown error';
                const statusCode = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
                throw new HttpException({
                    status: statusCode,
                    error: errorMessage,
                    details: error.response.data
                }, statusCode);
            } else {
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

    // This function generates a img from the text and returns the bufferd img
    async generateImage(prompt: string): Promise<{ resizedFilePath: string, imgUrl: string }> {
        try {
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('output_format', 'png');
            formData.append('model', 'sd3-large-turbo');
            formData.append('aspect_ratio', '9:16'); // Keep aspect ratio in mind

            const response = await axios.post(
                'https://api.stability.ai/v2beta/stable-image/generate/sd3',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.SK_STABILITY}`,
                        ...formData.getHeaders(),
                    },
                    responseType: 'json',
                }
            );

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            if (response.status === 200) {
                // Extract the Base64 image data from the response
                const imageBase64 = response.data.image; // This is the Base64 string
                const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');

                // Prepare the image directory
                const imagesDir = path.resolve(__dirname, '../../..', 'images');
                if (!fs.existsSync(imagesDir)) {
                    fs.mkdirSync(imagesDir, { recursive: true });
                }

                const filename = `generated_image_${Date.now()}.png`;
                const filePath = path.resolve(imagesDir, filename);

                // Write the decoded image to a file
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                console.log('Original image saved at:', filePath);

                // Resize the image to 1024x576 (or any other dimensions you prefer)
                const resizedFileName = `resized_image_${Date.now()}.png`;
                const resizedFilePath = path.resolve(imagesDir, resizedFileName);

                await sharp(filePath)
                    .resize(576, 1024) // Resize as per your requirement
                    .toFile(resizedFilePath); // Save the resized image

                console.log('Resized image saved at:', resizedFilePath);

                // Construct the public URL
                const baseUrl = 'https://postbet.ae/img'; // Base URL for your images
                const imgUrl = `${baseUrl}/${resizedFileName}`; // Correctly create the public URL

                return {resizedFilePath , imgUrl}; // Return the public URL of the resized image
            } else {
                throw new HttpException(
                    `Failed to generate image: ${response.statusText}`,
                    HttpStatus.BAD_REQUEST,
                );
            }
        } catch (error) {
            console.error('Error from stability:', error.response ? error.response.data : error.message);

            throw new HttpException(
                `Image generation failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    // This function generates a video from the image and returns the generation ID
    async generateVideo(imagePath: string): Promise<string> {
        try {
            const data = new FormData();
            data.append('image', fs.readFileSync(imagePath), "image.png"); // Reading the image file
            data.append('seed', 0);
            data.append('cfg_scale', 1.8);
            data.append('motion_bucket_id', 127);

            const response = await axios.request({
                url: 'https://api.stability.ai/v2beta/image-to-video',
                method: 'post',
                validateStatus: undefined,
                headers: {
                    authorization: `Bearer ${process.env.SK_STABILITY}`,
                    ...data.getHeaders(),
                },
                data: data,
            });

            console.log(response)

            if (response.status === 200) {
                console.log("Generation ID:", response.data.id);
                return response.data.id; // Return the generation ID for later retrieval
            } else {
                throw new HttpException(`Failed to generate video: ${response.statusText}`, HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new HttpException(`Video generation failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async waitForVideo(generationID: string): Promise<string> {
        const url = `https://api.stability.ai/v2beta/image-to-video/result/${generationID}`;

        while (true) {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${process.env.SK_STABILITY}`,
                    Accept: 'video/*', // or 'application/json' if expecting base64
                },
                responseType: 'arraybuffer',
                validateStatus: undefined,
            });

            if (response.status === 202) {
                console.log("Generation is still running, trying again in 10 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
            } else if (response.status === 200) {
                console.log("Generation is complete!");

                // Define the video directory
                const videoDir = path.join(__dirname, '../../..', 'videos');

                // Ensure the directory exists
                if (!fs.existsSync(videoDir)) {
                    fs.mkdirSync(videoDir, { recursive: true });
                    console.log('Created videos directory:', videoDir);
                }

                // Create the video file path
                const filename = `generated_video_${Date.now()}.mp4`
                const videoPath = path.join(videoDir, filename);


                // Construct the public URL
                const baseUrl = 'https://postbet.ae/vid'; // Base URL for your images
                const imgUrl = `${baseUrl}/${filename}`; // Correctly create the public URL

                // Write the video file
                fs.writeFileSync(videoPath, Buffer.from(response.data));
                console.log('Video saved at:', videoPath);

                return imgUrl; // Return the path of the saved video
            } else {
                throw new HttpException(`Error fetching video: ${response.status}: ${response.data.toString()}`, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    // Generate image first, then pass it to the video generator
    async generateImageAndVideo(prompt: string): Promise<string> {
        try {
            // Step 1: Generate the image
            const generatedImg = await this.generateImage(prompt);

            // Step 2: Generate the video from the image
            const videoId = await this.generateVideo(generatedImg.resizedFilePath);


            // Return the paths for both the generated image and video
            return videoId
        } catch (error) {
            throw new HttpException(`Failed to generate image and video: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Edit image
    async removeBackground(imagePath: string): Promise<any> {
        const payload = {
            image: fs.createReadStream(imagePath),
            output_format: 'webp',
        };

        const response = await axios.postForm(
            'https://api.stability.ai/v2beta/stable-image/edit/remove-background',
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: 'arraybuffer',
                headers: {
                    Authorization: `Bearer ${process.env.SK_STABILITY}`,
                    Accept: 'image/*',
                },
            },
        );

        // Construct the public URL
        const baseUrl = 'https://postbet.ae/img'; // Base URL for your images

        if (response.status === 200) {
            fs.writeFileSync(imagePath, Buffer.from(response.data)); // Overwrite the original image
            const imgUrl = `${baseUrl}/${path.basename(imagePath)}`; // Correctly create the public URL
            return { success: true, imgUrl };
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }
    }

    async searchAndReplace(imagePath: string, prompt: string, searchPrompt: string): Promise<any> {
        const payload = {
            image: fs.createReadStream(imagePath),
            prompt,
            search_prompt: searchPrompt,
            output_format: 'webp',
        };

        const response = await axios.postForm(
            'https://api.stability.ai/v2beta/stable-image/edit/search-and-replace',
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: 'arraybuffer',
                headers: {
                    Authorization: `Bearer ${process.env.SK_STABILITY}`,
                    Accept: 'image/*',
                },
            },
        );

        // Construct the public URL
        const baseUrl = 'https://postbet.ae/img'; // Base URL for your images

        if (response.status === 200) {
            fs.writeFileSync(imagePath, Buffer.from(response.data)); // Overwrite the original image
            const imgUrl = `${baseUrl}/${path.basename(imagePath)}`; // Correctly create the public URL
            return { success: true, imgUrl };
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }
    }

    async addBanner(url: string) {
        const banner = this.bannerRepository.create({ url });
        return this.bannerRepository.save(banner);
    }

    async deleteBanner(id: number) {
        // Find the banner by ID first
        const banner = await this.bannerRepository.findOne({ where: { id } });
        console.log(banner)
        if (!banner) {
            throw new NotFoundException(`Banner with ID ${id} not found`);
        }

        // Extract the filename from the URL (assuming the filename is stored in the banner's imgUrl)
        const filename = banner.url.split('/').pop();
        const imgPath = join(__dirname, '../../..', 'banners', filename);

        // Delete the banner from the database
        const result = await this.bannerRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Banner with ID ${id} could not be deleted`);
        }

        // Check if the file exists, and delete it if it does
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
        } else {
            console.log(`File not found: ${imgPath}`);
        }

        return { message: 'Banner and image file deleted successfully' };
    }

    async getAllBanners () : Promise <any>{
        const banners = await Banner.find()

        return banners
    }

    
}
