import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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


}