import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
  @Post('/post')
  addPost(@Body() addPostDto: AddPostDto, @Req() req){
    return this.postingService.addPost(req, addPostDto);
  }
}
