import { ApiProperty } from "@nestjs/swagger";
import { OBaseEntity } from "../generic/base.entity";
import { Column, Entity } from "typeorm";


@Entity()
export class Banner extends OBaseEntity {

    @ApiProperty()
    @Column()
    url: string;

}
