import { JoinColumn, JoinTable, OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Evenement } from "./evenement.schema";

@Entity("place")
export class Place {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @Column({ nullable : true})
    postCode: number;

    @Column({ nullable : true})
    country: string;

    @OneToMany(type => Evenement, event => event.startPoint)
    @JoinTable()
    eventsFrom: Evenement[];

    @OneToMany(type => Evenement, event => event.endPoint, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinTable()
    eventsTo: Evenement[];

}