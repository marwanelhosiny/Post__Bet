import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { CreatePromocodeDto } from '../../dtos/create-promocode.dto';
import { UpdatePromocodeDto } from '../../dtos/update-promocode.dto';
import { ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from 'src/guards/admin-user.guard';

@ApiTags('Promo Code')
@Controller('promocode')
export class PromocodeController {
  constructor(private readonly promocodeService: PromocodeService) {}

  @Post()
  create(@Body() createPromocodeDto: CreatePromocodeDto) {
    return this.promocodeService.create(createPromocodeDto);
  }

  @UseGuards(Admin_UserGuard)
  @Get()
  findAll(@Req() req) {
    return this.promocodeService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promocodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromocodeDto: UpdatePromocodeDto) {
    return this.promocodeService.update(+id, updatePromocodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocodeService.remove(+id);
  }
}
