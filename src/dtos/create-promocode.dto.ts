import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsInt, Max, Min } from "class-validator";

export class CreatePromocodeDto {

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
