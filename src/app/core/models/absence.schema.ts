import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity("absence")
export class Absence{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    driverId : string;

    @Column()
    date: string;

    @Column({default: false})
    absenceType: boolean;

    @Column({nullable: true})
    reason: string;
}