// add-post.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class AddPostDto {

    @ApiProperty()
    @IsString()
    post: string;

    @ApiProperty({
        items: {
            type: 'string',
            format: 'binary',
        },
        required: true,
    })
    mediaUrls: string;
}
