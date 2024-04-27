import { Injectable } from '@nestjs/common';
import { CreateContactUsDto } from '../../dtos/create-contact-us.dto';
import { UpdateContactUsDto } from '../../dtos/update-contact-us.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactUs } from '../../entities/contact-us.entity';
import { Repository } from 'typeorm';
import { UserType } from '../../enums/user-type.enum';

@Injectable()
export class ContactUsService {

  constructor(
    @InjectRepository(ContactUs) private readonly repo: Repository<ContactUs>,
  ) { }


  async create(createContactUsDto: CreateContactUsDto, req) {
    await this.repo.save({
      message: createContactUsDto.message,
      email: req.user.email,
      phone: createContactUsDto.phone
    });
    return "Contact Us send success";
  }


  async findAll(req) {
    if (req.user.userType == UserType.ADMIN) {
      return await this.repo.find();
    }
    if (req.user.userType == UserType.USER) {
      return await this.repo.find({ where: { email: req.user.email } });
    }
  }


  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }


  async update(id: number, updateContactUsDto: UpdateContactUsDto) {
    await this.repo.update(id, updateContactUsDto);
    return "Respond Sent Success";
  }

  async remove(id: number) {
    const entityToRemove = await this.repo.findOne({ where: { id } });
    if (!entityToRemove) {
      throw new Error('Entity not found');
    }
    await this.repo.remove(entityToRemove);
    return 'Entity deleted successfully';
  }
}
