import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from '../../dtos/create-plan.dto';
import { UpdatePlanDto } from '../../dtos/update-plan.dto';
import { Plan } from '../../entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from 'src/enums/user-type.enum';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private readonly repo: Repository<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    await this.repo.save(createPlanDto);
    return "Plan created successfully";
  }

  async findAll(req) {
    if(req.user.userType == UserType.ADMIN) {
      return await this.repo.find();
    }
    if(req.user.userType == UserType.USER) {
      return await this.repo.find({where:{isActive: true}});
    }  
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    await this.repo.update(id, updatePlanDto);
    return "Plan updated successfully";
  }

  async remove(id: number) {
    const entityToRemove = await this.repo.findOne({ where: { id } });
    if (!entityToRemove) {
      throw new Error('Entity not found');
    }
    await this.repo.remove(entityToRemove);
    return 'Entity deleted successfully';
  }

  //// make a cronejob to set used_counter equal zero everyday
}
