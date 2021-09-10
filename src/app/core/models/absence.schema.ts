import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToOne} from 'typeorm';
import { Driver } from './driver.schema'
@Entity("absence")
export class Absence{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: String

    @Column()
    isSelected: boolean;

    @Column()
    driverId : number;

    @Column({nullable: true})
    reason: string;

    @ManyToOne(type => Driver, driver => driver.absences, {
        onDelete: "CASCADE"
    })
    @JoinTable()
    driver: Driver;

      
    constructor(date, isSelected = false) {
        this.date = date;
        this.isSelected = isSelected;
      }
}