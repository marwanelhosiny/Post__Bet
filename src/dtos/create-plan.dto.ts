import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class CreatePlanDto {

    @ApiProperty()
    name: string;

    @ApiProperty()
    details: string;

    @ApiProperty()
    @IsInt()
    @Min(0)
    price: number;

    @ApiProperty()
    @IsInt()
    @Min(0)
    number_of_posts: number;

    @ApiProperty()
    // @IsOptional()
    @IsInt()
    @Min(0)
    limit_number_of_posts_per_day: number;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    vat: number;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    unLimited: boolean;

    @ApiProperty()
    isFree: boolean;

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

    @ApiProperty()
    YouTube?: boolean;

    @ApiProperty()
    GoogleBusiness?: boolean;

}
