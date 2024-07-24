import { Body, Controller, Get, Param, Post, Query, Render, Req, UseGuards } from '@nestjs/common';
import { PostingService } from './posting.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AddPostDto } from '../../dtos/post.dto';
import { UserGuard } from '../../guards/user.guard';


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
}
