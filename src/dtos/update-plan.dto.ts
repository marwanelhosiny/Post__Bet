import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plan.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {

    @ApiProperty()
    name: string;

    @ApiProperty()
    details: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    number_of_posts: number;

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
