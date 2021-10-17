import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToOne} from 'typeorm';
import { Driver } from './driver.schema'
@Entity("absence")
export class Absence{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    startDate: String

    @Column()
    endDate: String

    @Column({nullable: true})
    reason: string;

    @ManyToOne(type => Driver, driver => driver.absences, {onDelete: "CASCADE"})
    @JoinTable()
    driver: Driver;

    constructor(startDate, endDate) {
        this.startDate= startDate;
        this.endDate= endDate;
      }
}