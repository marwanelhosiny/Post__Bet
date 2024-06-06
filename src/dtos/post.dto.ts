import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsBoolean, IsOptional, IsString } from 'class-validator';

class FacebookOptions {

    @ApiProperty({ required: false })
    stories?: boolean;

    @ApiProperty({ required: false })
    reels?: boolean;

    @ApiProperty({ required: false })
    title?: string;
}

class InstagramOptions {

    @ApiProperty({ required: false })
    stories?: boolean;

    @ApiProperty({ required: false })
    reels?: boolean;

    @ApiProperty({ required: false })
    shareReelsFeed: boolean;

    @ApiProperty({ required: false })
    audioName: string;

    @ApiProperty({ required: false })
    coverUrl: string;

    @ApiProperty({ required: false })
    thumbNailOffset: number
}

class YouTubeOtions {
    @ApiProperty({ required: true })
    title: string

    @ApiProperty({ required: false })
    visibility: string

    @ApiProperty({ required: false })
    thumbNail: string

    @ApiProperty({ required: false })
    playListId: string

    @ApiProperty({ required: false })
    tags: [string]

    @ApiProperty({ required: false })
    madeForKids: boolean

    @ApiProperty({ required: false })
    shorts: boolean

    @ApiProperty({ required: false })
    notifySubscribers: boolean

    @ApiProperty({ required: false })
    categoryId: number

    @ApiProperty({ required: false })
    publishAt: string
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
        isArray: true,
        required: true,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    mediaUrls: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    faceBookOptions?: FacebookOptions;

    @ApiProperty({ required: false })
    @IsOptional()
    instagramOptions?: InstagramOptions;

    @ApiProperty({ required: false })
    @IsOptional()
    youtubeOptions?: YouTubeOtions;

    @ApiProperty()
    isVideo: boolean
}
