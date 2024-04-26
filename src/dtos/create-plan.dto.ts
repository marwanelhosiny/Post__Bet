import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class CreatePlanDto {

    @ApiProperty()
    name: string;

    @ApiProperty()
    details: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    number_of_posts: number;

    @ApiProperty()
    limit_number_of_posts_per_day: number;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    vat: number;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    Facebook: boolean;

    @ApiProperty()
    Instagram: boolean;

    @ApiProperty()
    LinkedIn: boolean;

    @ApiProperty()
    Pinterest: boolean;

    @ApiProperty()
    Reddit: boolean;

    @ApiProperty()
    Telegram: boolean;

    @ApiProperty()
    TikTok?: boolean;

    @ApiProperty()
    Twitter?: boolean;

}
