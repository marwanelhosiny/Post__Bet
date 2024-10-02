import { ApiHideProperty, ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { User } from "../entities/user.entity";
import { UserType } from "../enums/user-type.enum";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    // @ApiPropertyOptional({ default: UserType.USER })
    // userType: UserType;
}

export class UpdateUserDto {
    
    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    profileImage: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    facebookUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    twitterUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    instagramUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    youtubeUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tiktokUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    snapchatUrl?: string;
}

export class LoginDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    // @ApiHideProperty()
    // userType: UserType;
}

export class SignUpDto {

    @ApiProperty()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    facebookUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    twitterUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    instagramUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    youtubeUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tiktokUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    snapchatUrl?: string;


}


export class LoginEmailDto {
    @ApiProperty()
    email: string;
}

export class verifyOtpDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    otp: string;
}

export interface JwtUser {
    macAddress: string | null,
    id: string,
    username: string
    userType: UserType,
    user: User;

}

// export class UpdateUserDto extends PartialType(CreateUserDto) { }
