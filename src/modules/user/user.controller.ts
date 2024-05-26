import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpException, Query, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from '../../guards/admin-user.guard';
import * as cron from 'node-cron';
import { UserGuard } from '../../guards/user.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { EnumValidationPipe } from '../../shared/enum-validation';
import { UserType } from '../../enums/user-type.enum';



@ApiBearerAuth()
@ApiTags('User')
@Controller('User')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(AdminGuard)
  @Post()
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @UseGuards(Admin_UserGuard)
  @ApiQuery({ name: 'userType', enum: UserType, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @Get()
  async filerByType(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('userType') userType?: UserType,
  ) {
    return await this.userService.filterUsers(userType, page, pageSize);
  }

  @UseGuards(Admin_UserGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @ApiBody({ type: UpdateUserDto })
  @UseGuards(Admin_UserGuard)
  @Put(':id')
  async updateOne(@Param('id') id: number, @Body() body) {
    return await this.userService.updateUser(id, body)
  }

  @UseGuards(Admin_UserGuard)
  @Delete(':id')
  async deleteOne(@Param('id') id: number) {
    // Schedule deletion after 14 days
    // cron.schedule('0 0 */14 * *', async () => {
    await this.userService.deleteUser(id);
    // });
    //   cron.schedule('*/2 * * * *', async () => {
    // await this.userService.deleteUser(id);
    // });
    return "Delete postbet account and associated ayrshare account success";
  }
}

///when delete user create its account on ayrshare
/// make sure for shedule posts