import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from '../../dtos/create-plan.dto';
import { UpdatePlanDto } from '../../dtos/update-plan.dto';
import { ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from '../../guards/admin-user.guard';
import { UserGuard } from '../../guards/user.guard';
import { PlanSubscripeDto } from '../../dtos/plan-subscripe.dto';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  postingService: any;
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @UseGuards(Admin_UserGuard)
  @Get()
  findAll(
    @Req() req,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') search: string) {
    return this.plansService.findAll(req, page, pageSize, search);
  }

  @UseGuards(UserGuard)
  @Get('/my-subscribtion')
  mySubscribtion( @Req() req){
    return this.plansService.mySubscribtion(req)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(+id);
  }

  @UseGuards(UserGuard)
  @Post('/subscribe')
  makeSubscribtion(@Body() planSubscripeDto:PlanSubscripeDto, @Req() req){
    return this.plansService.makeSubscription(planSubscripeDto, req)
  }

}
