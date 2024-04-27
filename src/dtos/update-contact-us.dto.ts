import { PartialType } from '@nestjs/mapped-types';
import { CreateContactUsDto } from './create-contact-us.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContactUsDto extends PartialType(CreateContactUsDto) {

    @ApiProperty()
    replyMessage?: string;

    @ApiProperty()
    flagReply?: boolean;

}
