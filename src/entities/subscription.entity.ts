// user-program-subscription.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Promocode } from './promocode.entity';
import { OBaseEntity } from '../generic/base.entity';
import { Plan } from './plan.entity';
import { ApiProperty } from '@nestjs/swagger';


export enum PaymentStatus {
    Pending = 'Pending',
    Free = 'Free',
    Paid = 'Paid',
}

@Entity()
export class UserProgramSubscription extends OBaseEntity {

    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.Pending })
    paymentStatus: PaymentStatus;

    @Column({ nullable: true, default: 0})
    totalPrice: number;

    @Column({ type: 'float', default: 0 })
    discount: number;

    @Column({ type: 'float', default: 0 })
    vatAmount: number;

    @Column({ type: 'float', default: 0 })
    finalPrice: number;

    @Column({nullable: true })
    todayUsedPlanCounter: number;

    @Column({ type: 'date' })
    startDayPlanSubscription: Date;    

    @ManyToOne(() => Promocode, { nullable: true })
    promocode: Promocode;

    @ManyToOne(() => User, user => user.userProgramSubscriptions, { onDelete: 'SET NULL' })
    user: User;

    @ManyToOne(() => Plan, plan => plan.userProgramSubscriptions)
    plan: Plan;

    @Column({ nullable: true })
    chargeId: string;

    @Column({ nullable: true })
    transactionUrl: string;

    @Column({ default: 0 })
    planUsedCounter: number;
}
