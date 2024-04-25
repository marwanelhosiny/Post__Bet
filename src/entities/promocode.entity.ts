import { ApiProperty } from "@nestjs/swagger";
import { OBaseEntity } from "src/generic/base.entity";
import { Column, Entity } from "typeorm";


@Entity()
export class Promocode extends  OBaseEntity {

    @ApiProperty()
    @Column({ unique: true })
    PromoCode?: string;

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
