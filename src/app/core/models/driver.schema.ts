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

    @Column()
    phoneNumber: string;

    @Column()
    email: string;

    @OneToMany(type => Evenement, event => event.driver)
    @JoinColumn({name : 'event_id'})
    evenements: Evenement[];
    
}