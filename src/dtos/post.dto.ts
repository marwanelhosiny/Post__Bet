import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsBoolean, IsOptional } from 'class-validator';

class FacebookOptions {
    @ApiProperty({ required: false })
    reels?: boolean;

    @ApiProperty({ required: false })
    stories?: boolean;

    @ApiProperty({ required: false })
    title?: string;
}

export class AddPostDto {

    @ApiProperty()
    post: string;

    @ApiProperty({
        type: [{ platform: String, isSelected: Boolean }],
        isArray: true,
    })
    @IsArray()
    @ArrayNotEmpty()
    platform: { platform: string, isSelected: boolean }[];

    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: true,
    })
    mediaUrls: string;

    @ApiProperty({ required: false })
    @IsOptional()
    faceBookOptions?: FacebookOptions;
}
