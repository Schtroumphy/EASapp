import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { Evenement } from './evenement.schema';
@Entity("patient")
export class Patient{
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

    @Column({default: null, nullable: true})
    address: string;

    @OneToMany(type => Evenement, event => event.patient)
    @JoinColumn({name : 'event_id'})
    evenements: Evenement[];

    @Column({default: null, nullable: true})
    comment: string;

}