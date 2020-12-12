import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { ManyToOne } from "typeorm/decorator/relations/ManyToOne";
import { Driver } from './driver.schema'
import { Patient } from './patient.schema'

@Entity()
export class Evenement {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    date: string;

    @Column()
    startPoint: string;

    @Column()
    startHour: string;

    @Column()
    endPoint: string;

    @Column()
    endHour: string;

    @ManyToOne(type => Driver, driver => driver.evenements)
    driver: Driver;

    @ManyToOne(type => Patient, patient => patient.evenements)
    patient: Patient;

}