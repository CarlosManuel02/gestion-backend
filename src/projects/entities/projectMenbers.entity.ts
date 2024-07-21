import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('project_members')
export class ProjectMenbers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'date' })
  join_date: Date;
}
