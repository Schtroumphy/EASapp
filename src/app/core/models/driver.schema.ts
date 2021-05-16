import { last } from 'rxjs/operators';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { Evenement } from './evenement.schema';

@Entity()
export class Driver{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({default: null, nullable: true})
    phoneNumber: string;

    @Column({default: null, nullable: true})
    email: string;

    @Column({nullable: false})
    color: string;

    @OneToMany(type => Evenement, event => event.driver)
    @JoinColumn({name : 'event_id'})
    evenements: Evenement[];

    @Column({default: null, nullable: true})
    comment: string;
}