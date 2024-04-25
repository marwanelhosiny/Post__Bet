import { ApiHideProperty, ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { User } from "src/entities/user.entity";
import { UserType } from "src/enums/user-type.enum";

export class CreateUserDto {

    @ApiProperty()
    mobile: string;

    @ApiProperty()
    password: string;

    @ApiPropertyOptional({ default: UserType.USER })
    userType: UserType;
}

export class UpdateUserDto {
    
    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    profileImage: string;
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
    email: string;

    @ApiProperty()
    password: string;
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
