import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { CreatePromocodeDto } from '../../dtos/create-promocode.dto';
import { UpdatePromocodeDto } from '../../dtos/update-promocode.dto';
import { ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from '../../guards/admin-user.guard';
import { AdminGuard } from 'src/guards/admin.guard';

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
  @Get()
  findAll(@Req() req) {
    return this.promocodeService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promocodeService.findOne(+id);
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
