import { PartialType } from '@nestjs/mapped-types';
import { CreatePromocodeDto } from './create-promocode.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdatePromocodeDto extends PartialType(CreatePromocodeDto) {

    @ApiProperty()
    promoCode: string;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    percentage: number;

    @ApiProperty()
    @IsInt()
    @Min(0)
    // @Max(100)
    numberOfUses: number;

    @ApiProperty()
    isActive: boolean;
}
