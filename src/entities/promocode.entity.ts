import { ApiProperty } from "@nestjs/swagger";
import { OBaseEntity } from "../generic/base.entity";
import { Column, Entity, ManyToMany } from "typeorm";
import { User } from "./user.entity";


@Entity()
export class Promocode extends OBaseEntity {

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
    @Column({ default: 0 })
    usedCounter: number;

    @ApiProperty()
    @Column({ default: 0 })
    numberOfUses: number;

    @ApiProperty()
    @Column({ type: 'timestamp', nullable: true })
    expirationDate?: Date;

    @ManyToMany(() => User, user => user.promocode)
    user?: User[];
}
