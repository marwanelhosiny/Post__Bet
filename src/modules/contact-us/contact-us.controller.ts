import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from '../../dtos/create-contact-us.dto';
import { UpdateContactUsDto } from '../../dtos/update-contact-us.dto';
import { ApiTags } from '@nestjs/swagger';
import { Admin_UserGuard } from '../../guards/admin-user.guard';

@ApiTags('Contact Us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  create(@Body() createContactUsDto: CreateContactUsDto) {
    return this.contactUsService.create(createContactUsDto);
  }

  @UseGuards(Admin_UserGuard)
  @Get()
  findAll(@Req() req) {
    return this.contactUsService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactUsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactUsDto: UpdateContactUsDto) {
    return this.contactUsService.update(+id, updateContactUsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactUsService.remove(+id);
  }
}
