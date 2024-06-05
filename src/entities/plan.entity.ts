import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, OneToMany, UpdateDateColumn } from 'typeorm';
import { OBaseEntity } from '../generic/base.entity';
import { UserProgramSubscription } from './subscription.entity';

@Entity()
export class Plan extends OBaseEntity{

    @ApiProperty()
    @Column({ unique: false, nullable: true })
    name?: string;

    @ApiProperty()
    @Column({ unique: false, nullable: true })
    details?: string;

    @ApiProperty()
    @Column({ nullable: true })
    price?: number;

    @ApiProperty()
    @Column({ nullable: true })
    number_of_posts?: number;

    @ApiProperty()
    @Column({ nullable: true })
    limit_number_of_posts_per_day?: number;

    @ApiProperty()
    @Column({ default: 0 })
    vat?: number;

    @ApiProperty()
    @Column({ default: false })
    isActive?: boolean;

    @ApiProperty()
    @Column({ default: false })
    isFree?: boolean;

    @ApiProperty()
    @Column({ default: false })
    unLimited?: boolean;

    @ApiProperty()
    @Column({ default: false })
    Facebook?: boolean;

    @ApiProperty()
    @Column({ default: false })
    Instagram?: boolean;

    @ApiProperty()
    @Column({ default: false })
    LinkedIn?: boolean;

    @ApiProperty()
    @Column({ default: false })
    Twitter?: boolean;

    @ApiProperty()
    @Column({ default: false })
    Telegram?: boolean;

    @ApiProperty()
    @Column({ default: false })
    TikTok?: boolean;

    @ApiProperty()
    @Column({ default: false })
    Pinterest?: boolean;

    @ApiProperty()
    @Column({ default: false })
    Reddit?: boolean;

    @ApiProperty()
    @Column({ default: false })
    YouTube?: boolean;

    @ApiProperty()
    @Column({ default: false })
    GoogleBusiness?: boolean;

    @OneToMany(() => UserProgramSubscription, subscription => subscription.plan)
    userProgramSubscriptions: UserProgramSubscription[];

}
