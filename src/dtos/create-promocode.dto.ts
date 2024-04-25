import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class CreatePromocodeDto {

    @ApiProperty()
    promoCode: string;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    percentage: number;

    @ApiProperty()
    isActive: boolean;
}
