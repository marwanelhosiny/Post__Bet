import { Body, Controller, Delete, Get, Param, Post, Query, Render, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostingService } from './posting.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AddPostDto } from '../../dtos/post.dto';
import { UserGuard } from '../../guards/user.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname, join } from 'path';
import * as sharp from 'sharp';
import { AdminGuard } from 'src/guards/admin.guard';
import { Admin_UserGuard } from 'src/guards/admin-user.guard';





@ApiTags('Posting')
@Controller('Posting')
export class  PostingController {
  constructor(private readonly postingService: PostingService) {}

  // @UseGuards(JwtAuthGuard)
  // @Post('/create-user-profile')
  // createUserProfile(@Req() req){
  //   return this.postingService.createUserProfile();
  // }

  @UseGuards(UserGuard)
  @Post('/post/:subscriptionId')
  addPost(
    @Param('subscriptionId') subscriptionId: number,
    @Body() addPostDto: AddPostDto, @Req() req){
    return this.postingService.addPost(subscriptionId,req, addPostDto);
  }

  @Get('/platformConfirmation')
  @Render('confirm-platform')
  renderConfirmPayment(
  ) {}

  @UseGuards(UserGuard)
  @Post('/post/schedule/:subscriptionId')
  async schedulePost(
    @Param('subscriptionId') subscriptionId: number,
    @Req() req: any,
    @Body() addPostDto: AddPostDto,
    @Query('scheduleDate') scheduleDate: string
  ) {
    return this.postingService.schedulePost(subscriptionId, req, addPostDto, scheduleDate);
  }

  @UseGuards(UserGuard)
  @Get('/history')
  async getPostHistory(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('lastDays') lastDays?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('platform') platform?: string | string[],
    @Query('objResponse') objResponse?: string
  ) {
    const transformedParams = {
      status,
      lastDays: lastDays ? parseInt(lastDays, 10) : 30,
      limit: limit ? parseInt(limit, 10) : 10,
      type,
      platform: Array.isArray(platform) ? platform : platform ? [platform] : undefined,
      objResponse: objResponse === 'true',
    };
    return this.postingService.getPostHistory(req, transformedParams);
  }

  @Post('/generate/img')
  async genImg (
    @Body('prompt') prompt:string
  ){
    return this.postingService.generateImage(prompt)
  }

  @Post('/generate/vid')
  async genVid (
    @Body('prompt') prompt:string
  ){
    return this.postingService.generateImageAndVideo(prompt)
  }
  @Post('/generate/imgtovid')
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'image', maxCount: 1 }, // Uploading a single image
    ],
    {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB size limit
      fileFilter: (req, file, cb) => {
        // Only accept jpg, jpeg, png files
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const imgDir = join(__dirname, '../../..', 'images'); // Path to save images
          fs.mkdirSync(imgDir, { recursive: true }); // Create folder if it doesn't exist
          cb(null, imgDir); // Save image in this directory
        },
        filename: (req, file, cb) => {
          // Save the file with a timestamp and the original file extension
          cb(null, `${file.fieldname}-${Date.now()}${extname(file.originalname)}`);
        },
      }),
    }
  ))
  async imgToVid(
    @UploadedFiles() files: { image?: Express.Multer.File[] }, // Handle uploaded files
  ) {
    if (!files.image || files.image.length === 0) {
      throw new Error('No image file uploaded!');
    }

    // Get the path of the saved image
    const imagePath = files.image[0].path; // Path of the uploaded image

    // Define the path for the resized image
    const resizedFileName = `resized_image_${Date.now()}.png`;
    const resizedFilePath = join(__dirname, '../../..', 'images', resizedFileName);

    await sharp(imagePath)
      .resize(576, 1024) // Resize as per your requirement
      .toFile(resizedFilePath); // Save the resized image

    // Pass the image path and prompt to the posting service for video generation
    return this.postingService.generateVideo(resizedFilePath);
  }

  @Get('/generate/vid/:generatedId')
  async getVid (
    @Param('generatedId') generatedId:string
  ){
    return this.postingService.waitForVideo(generatedId)
  }

  @Post('/edit-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const imgDir = join(__dirname, '../../..', 'images');
        if (!fs.existsSync(imgDir)) {
          fs.mkdirSync(imgDir, { recursive: true });
        }
        cb(null, imgDir);
      },
      filename: (req, file, cb) => {
        const filename = `image_${Date.now()}${extname(file.originalname)}`;
        cb(null, filename);
      }
    })
  }))
  async editImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { prompt?: string; searchPrompt?: string; removeBackground?: boolean; searchAndReplace?: boolean }
  ) {
    try {
      const filePath = file.path;

      // Step 1: Remove Background if requested
      if (body.removeBackground) {
        return this.postingService.removeBackground(filePath);
      }

      // Step 2: Search and Replace if requested
      if (body.searchAndReplace && body.prompt && body.searchPrompt) {
        return this.postingService.searchAndReplace(filePath, body.prompt, body.searchPrompt);
      }

      // Return the original image URL if no editing options were selected
      const baseUrl = 'https://postbet.ae/img'; // Base URL for your images
      const imgUrl = `${baseUrl}/${file.filename}`;
      return { success: true, imagePath: imgUrl };

    } catch (error) {
      throw new Error(`Image editing failed: ${error.message}`);
    }
  }
  @UseGuards(AdminGuard)
  @Post('/banner')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const imgDir = join(__dirname, '../../..', 'banners');
        if (!fs.existsSync(imgDir)) {
          fs.mkdirSync(imgDir, { recursive: true });
        }
        cb(null, imgDir);
      },
      filename: (req, file, cb) => {
        const filename = `image_${Date.now()}${extname(file.originalname)}`;
        cb(null, filename);
      }
    })
  }))
  async addBanner(
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const filePath = file.path;


      // Return the original image URL if no editing options were selected
      const baseUrl = 'https://postbet.ae/banner'; // Base URL for your images
      const imgUrl = `${baseUrl}/${file.filename}`;


      return this.postingService.addBanner(imgUrl);

    } catch (error) {
      throw new Error(`adding  banner failed: ${error.message}`);
    }
  }
  
  @UseGuards(AdminGuard)
  @Delete('/banner/:id')
  async delBanner(
    @Param('id') id:number
  ) {
    return this.postingService.deleteBanner(id);
  }

  @UseGuards(Admin_UserGuard)
  @Get('/banner')
  async getBanners() {
    return this.postingService.getAllBanners();
  }

  
}
