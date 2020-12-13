import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { Evenement } from './evenement.schema';
@Entity()
export class Patient{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    phoneNumber: string;

    @Column()
    email: string;

    @Column()
    address: string;

    @OneToMany(type => Evenement, event => event.patient)
    @JoinColumn({name : 'event_id'})
    evenements: Evenement[];

}