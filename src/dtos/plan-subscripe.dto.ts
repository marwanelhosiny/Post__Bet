import { ApiProperty } from "@nestjs/swagger";

export class PlanSubscripeDto {

    @ApiProperty()
    promoCode: string;

    @ApiProperty()
    planId: number;

}
