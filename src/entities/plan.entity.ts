import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, OneToMany } from 'typeorm';
import { OBaseEntity } from '../generic/base.entity';
import { UserProgramSubscription } from './subscription.entity';

@Entity()
export class Plan extends OBaseEntity {
    @ApiProperty()
    @Column({ unique: false, nullable: true })
    name?: string;

    @ApiProperty()
    @Column({ unique: false, nullable: true })
    details?: string;

    @ApiProperty()
    @Column({ default: 0 })
    price?: number;

    @ApiProperty()
    @Column({ nullable: true })
    number_of_posts?: number;

    @ApiProperty()
    @Column({ default: true })
    isActive?: boolean;

    @OneToMany(() => UserProgramSubscription, userProgramSubscriptions => userProgramSubscriptions.plan)
    userProgramSubscriptions?: UserProgramSubscription[];
}
