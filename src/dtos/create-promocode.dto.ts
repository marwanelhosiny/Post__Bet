import { ApiProperty } from "@nestjs/swagger";

export class CreatePromocodeDto {

    @ApiProperty()
    PromoCode: string;

    @ApiProperty()
    percentage: number;

    @ApiProperty()
    isActive: boolean;
}
