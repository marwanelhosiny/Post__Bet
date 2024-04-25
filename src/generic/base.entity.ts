import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export abstract class OBaseEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment',)
    @ApiProperty()
    id?: number;

    @CreateDateColumn({ type: 'timestamp' })
    @ApiProperty({ readOnly: true, required: false })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    @ApiProperty({ readOnly: true, required: false })
    updatedAt?: Date;
}