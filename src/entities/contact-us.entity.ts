import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';
import { OBaseEntity } from '../generic/base.entity';


@Entity()
export class ContactUs extends OBaseEntity {

    @ApiProperty()
    @Column()
    name?: string;

    @ApiProperty()
    @Column()
    message?: string;

    @ApiProperty()
    @Column()
    email?: string;

    @ApiProperty()
    @Column()
    phone?: string;

    @ApiProperty()
    @Column({nullable: true})
    replyMessage?: string;

    @ApiProperty()
    @Column({ default: false })
    flagReply?: boolean;

} 