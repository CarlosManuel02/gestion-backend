import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('project_repositories')
export class ProjectRepo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  project_id: string;

  @Column('text')
  url: string;
}
