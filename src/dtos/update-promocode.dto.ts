import { PartialType } from '@nestjs/mapped-types';
import { CreatePromocodeDto } from './create-promocode.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePromocodeDto extends PartialType(CreatePromocodeDto) {

    @ApiProperty()
    PromoCode: string;

    @ApiProperty()
    percentage: number;

    @ApiProperty()
    isActive: boolean;
}
