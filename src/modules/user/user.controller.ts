import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpException, Query, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from '../../guards/admin-user.guard';
import * as cron from 'node-cron';
import { UserGuard } from 'src/guards/user.guard';



@ApiBearerAuth()
@ApiTags('User')
@Controller('User')
@UseGuards(JwtAuthGuard)
export class UserController  {
  constructor(private readonly userService: UserService) {}

  // // @Role(['Admin'])
  // // @UseGuards(RolesGuard)
  // @Post()
  // // @ApiResponse({ type: CreateUserDto, })
  // @ApiBody({ type: CreateUserDto, })
  // async create(@Body() createUserDto: CreateUserDto) {
  //   return await this.userService.create(createUserDto);
  // }

  //TODO: convert this query to Path param
  // @Get('filterByType/')
  // async filerByType(
  //   @Query('type', new EnumValidationPipe(UserType)) type: string,
  //   @Query('page') page: number,
  //   @Query('pageSize') pageSize: number,
  // ) {

  //   return await this.userService.filterUsers(type, page, pageSize)

  // }

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

  @UseGuards(UserGuard)
  @Delete(':id')
  async deleteOne(@Param('id') id: number) {
    // Schedule deletion after 14 days
    cron.schedule('0 0 */14 * *', async () => {
        await this.userService.deleteUser(id);
    });
  //   cron.schedule('*/2 * * * *', async () => {
  //     await this.userService.deleteUser(id);
  // });
    return { scheduled: true };
  }
}
