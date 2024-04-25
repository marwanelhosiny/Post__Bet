import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, OneToMany, UpdateDateColumn } from 'typeorm';
import { OBaseEntity } from '../generic/base.entity';

@Entity()
export class Plan extends OBaseEntity{

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

}
