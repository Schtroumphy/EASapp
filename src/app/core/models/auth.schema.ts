import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity("authentification")
export class Authentification{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    identifiant: string;

    @Column({default: false})
    isMaster: boolean;

    @Column({nullable: true})
    creationDate: string;
}