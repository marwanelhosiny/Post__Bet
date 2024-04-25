// user-program-subscription.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Promocode } from './promocode.entity';
import { OBaseEntity } from '../generic/base.entity';
import { Plan } from './plan.entity';


export enum PaymentStatus {
    Pending = 'Pending',
    Paid = 'Paid',
}

@Entity()
export class UserProgramSubscription extends OBaseEntity {


    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.Pending })
    status: PaymentStatus;

    @Column({ type: 'float' })
    totalPrice: number;

    @Column({ type: 'float', default: 0 })
    discount: number;

    @Column({ type: 'float', default: 0 })
    finalPrice: number;

    @ManyToOne(() => Promocode, { nullable: true })
    promocode: Promocode;

    @ManyToOne(() => User, user => user.userProgramSubscriptions)
    user: User;

    @ManyToOne(() => Plan, plan => plan.userProgramSubscriptions)
    plan: Plan;

    @Column({ nullable: true })
    paymentId: string;

    @Column({ nullable: true })
    tranRef: string;

    @Column({ nullable: true })
    session: string;

    @Column({ nullable: true })
    userProgramUsedCounter: number;
}
