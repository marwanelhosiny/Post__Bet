import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpDto {
    // @ApiProperty()
    // email: string;

    @ApiProperty()
    otp: string;
}

export class ChangeForgetPasswordDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    newPassword: string;
}

export class ForgetPasswordEmailDto {
    @ApiProperty()
    email: string;
}

