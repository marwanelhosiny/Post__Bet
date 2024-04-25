import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PostingService } from './posting.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AddPostDto } from '../../dtos/post.dto';


@ApiTags('Posting')
@Controller('Posting')
export class  PostingController {
  constructor(private readonly postingService: PostingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create-user-profile')
  createUserProfile(@Req() req){
    return this.postingService.createUserProfile(req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/post')
  addPost(@Body() addPostDto: AddPostDto, @Req() req){
    return this.postingService.addPost(req.user.id, addPostDto);
  }
}
