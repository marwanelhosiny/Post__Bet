import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { CreatePromocodeDto } from '../../dtos/create-promocode.dto';
import { UpdatePromocodeDto } from '../../dtos/update-promocode.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from '../../guards/admin-user.guard';
import { AdminGuard } from '../../guards/admin.guard';

@ApiTags('Promo Code')
@Controller('promocode')
export class PromocodeController {
  constructor(private readonly promocodeService: PromocodeService) {}

  @UseGuards(AdminGuard)
  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() createPromocodeDto: CreatePromocodeDto) {
    return this.promocodeService.create(createPromocodeDto);
  }

  @UseGuards(Admin_UserGuard)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @Get()
  findAll(
    @Req() req,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') search: string,
  ) {
    return this.promocodeService.findAll(req, page, pageSize, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promocodeService.findOne(+id);
  }

  @Get('checkPromoCode/:promoCode/:planId')
  checkPromoCode(
    @Param('promoCode') promoCode: string,
    @Param('planId') planId: number
) {
    return this.promocodeService.checkPromoCode(promoCode, planId);
  }

  @UseGuards(AdminGuard)
  @UsePipes(ValidationPipe)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromocodeDto: UpdatePromocodeDto) {
    return this.promocodeService.update(+id, updatePromocodeDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocodeService.remove(+id);
  }
}
