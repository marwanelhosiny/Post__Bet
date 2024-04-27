import { ApiProperty } from "@nestjs/swagger";

export class CreateContactUsDto {


    @ApiProperty()
    message?: string;

    @ApiProperty()
    phone?: string;

    // @ApiProperty()
    // replyMessage?: string;

    // @ApiProperty()
    // flagReply?: boolean;

}
