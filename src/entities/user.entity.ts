import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, OneToMany, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { OBaseEntity } from '../generic/base.entity';
import { SUtils } from '../shared/utils';
import { UserType } from '../enums/user-type.enum';
import { UserProgramSubscription } from './subscription.entity';
import { Promocode } from './promocode.entity';

@Entity()
export class User extends OBaseEntity {

    @ApiProperty()
    @Column({ unique: false, nullable: true })
    name?: string;

    @ApiProperty({ required: true })
    @Column({ unique: true, nullable: false, })
    email?: string;

    @ApiProperty({ writeOnly: true })
    @Column({
        nullable: true,
        select: false,
        transformer: {
            to: (value) => {
                if (!value || value === null) return;
                return SUtils.encryptPassword(value);
            },
            from: (value) => {
                if (!value || value === null) return;
                return SUtils.dycreptPassword(value);
            },
        },
    })
    password?: string;

    @ApiPropertyOptional({ default: false })
    @Column({ default: false })
    isActive?: boolean;

    @ApiPropertyOptional()
    @Column({ default: false })
    suspended?: boolean;

    @ApiPropertyOptional({ enum: UserType })
    @Column({ default: UserType.USER, type: 'simple-enum', enum: [UserType.ADMIN, 
        // UserType.SUPPLIER, UserType.SELLER, UserType.ORGANIZER, 
        UserType.USER] })
    userType?: UserType;

    @ApiPropertyOptional()
    @Column({ nullable: true, type: 'text' }) // Use TEXT type for base64 encoded image
    profileImage?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    otp?: string;

    // @ApiPropertyOptional()
    @Column({ nullable: true })
    profileKey?: string;

    // @ApiPropertyOptional()
    @Column({ nullable: true })
    refId?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    otpRequestDate?: Date;

    // @ApiPropertyOptional()
    @Column({ default: false })
    verifiedOtp?: boolean;

    @ApiPropertyOptional()
    @UpdateDateColumn({ nullable: true })
    lastLoginTime?: Date;

    @ApiPropertyOptional()
    @Column({ default: false })
    haveAccount?: boolean;

    @ApiPropertyOptional()
    @Column({ default: true })
    firstTime?: boolean;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    facebookUrl?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    twitterUrl?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    instagramUrl?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    youtubeUrl?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    tiktokUrl?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    snapchatUrl?: string;

    @OneToMany(() => UserProgramSubscription, userProgramSubscriptions => userProgramSubscriptions.user)
    userProgramSubscriptions?: UserProgramSubscription[];

    @JoinTable({})
    @ManyToMany(()=>Promocode, promocode => promocode.user)
    promocode?: Promocode[]
}