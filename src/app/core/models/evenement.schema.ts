import { JoinColumn, JoinTable } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { ManyToOne } from "typeorm/decorator/relations/ManyToOne";
import { Driver } from './driver.schema'
import { Patient } from './patient.schema'
import { Place } from "./place.schema";

@Entity("evenement")
export class Evenement {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    date: string;

    @ManyToOne(type => Place, startPoint => startPoint.eventsFrom)
    @JoinTable()
    startPoint: Place;

    @Column()
    startHour: string;

    @ManyToOne(type => Place, startPoint => startPoint.eventsTo)
    @JoinTable()
    endPoint: Place;

    @Column()
    endHour: string;

    @ManyToOne(type => Driver, driver => driver.evenements, {
        onDelete: "CASCADE"
    })
    @JoinTable()
    driver: Driver;

    @ManyToOne(type => Patient, patient => patient.evenements, {
        onDelete: "CASCADE"
    })
    @JoinTable()
    patient: Patient;

}