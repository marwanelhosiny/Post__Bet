import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsBoolean } from 'class-validator';

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
}
