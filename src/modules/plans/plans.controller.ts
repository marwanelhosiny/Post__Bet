import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from '../../dtos/create-plan.dto';
import { UpdatePlanDto } from '../../dtos/update-plan.dto';
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from '../../guards/admin-user.guard';
import { UserGuard } from '../../guards/user.guard';
import { PlanSubscripeDto } from '../../dtos/plan-subscripe.dto';
import { AdminGuard } from '../../guards/admin.guard';
import { PaymentStatus } from '../../entities/subscription.entity';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  postingService: any;
  constructor(private readonly plansService: PlansService) {}

  @UseGuards(AdminGuard)
  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
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
    @Query('search') search: string) {
    return this.plansService.findAll(req, page, pageSize, search);
  }

  @UseGuards(UserGuard)
  @Get('/mySubscribtions')
  mySubscribtion(@Req() req){
    return this.plansService.mySubscribtion(req)
  }

  @UseGuards(AdminGuard)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'paymentStatus', enum: PaymentStatus, required: false })
  @Get('/getAllSubscriptionForAdmin')
  getAllSubscribtion(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.plansService.getAllSubscription(page, pageSize, paymentStatus);
  }

  @UseGuards(UserGuard)
  @Get('subscribe/confirmPayment/:chargeId')
  confirmPayment(@Param('chargeId') chargeId: string, @Req() req) {
    return this.plansService.confirmPayment(chargeId, req)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(+id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(+id, updatePlanDto);
  }

  @UseGuards(AdminGuard)
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
