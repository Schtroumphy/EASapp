import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToOne} from 'typeorm';
import { Driver } from './driver.schema'
@Entity("absence")
export class Absence{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    startDate: string

    @Column()
    endDate: string

    @Column({nullable: true})
    reason: string;

    @ManyToOne(type => Driver, driver => driver.absences, {onDelete: "CASCADE"})
    @JoinTable()
    driver: Driver;

    constructor(startDate, endDate, reason) {
        this.startDate= startDate;
        this.endDate= endDate;
        this.reason = reason
      }
}