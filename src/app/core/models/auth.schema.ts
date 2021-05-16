import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Authentification{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    identifiant: string;

    @Column({default: false})
    isMaster: boolean;

    @Column()
    creationDate: string;
}