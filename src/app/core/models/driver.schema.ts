import { last } from 'rxjs/operators';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { Evenement } from './evenement.schema';
import { Absence } from './absence.schema';

@Entity("driver")
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

    @OneToMany(type => Absence, absence => absence.driver)
    @JoinColumn({name : 'absence_id'})
    absences: Absence[];

    @Column({default: null, nullable: true})
    comment: string;
}