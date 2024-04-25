import { ApiProperty } from "@nestjs/swagger";
import { OBaseEntity } from "../generic/base.entity";
import { Column, Entity } from "typeorm";


@Entity()
export class Promocode extends  OBaseEntity {

    @ApiProperty()
    @Column({ unique: true })
    promoCode?: string;

    @ApiProperty()
    @Column({})
    percentage?: number;

    @ApiProperty()
    @Column({ default: true })
    isActive?: boolean;

    @ApiProperty()
    @Column({ default: 0})
    usedCounter: number;


    // add constrain in entity to get onlly objects where isActive ==true
}
