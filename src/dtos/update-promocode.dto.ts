import { PartialType } from '@nestjs/mapped-types';
import { CreatePromocodeDto } from './create-promocode.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
    @IsDate()
    @Type(() => Date)
    expirationDate: Date;

    @ApiProperty()
    isActive: boolean;
}
