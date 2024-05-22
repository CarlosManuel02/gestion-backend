import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity('project_members')
export class ProjectMenbers {
  @PrimaryGeneratedColumn('uuid')
  project_id: string;

  @Column({type: 'uuid'})
  user_id: string;
}
