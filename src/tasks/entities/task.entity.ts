import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  task_key: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: string;

  @Column({ type: 'date', nullable: false })
  creation_date: Date;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'int', nullable: false })
  priority: number;

  @Column({ type: 'uuid', nullable: false })
  assignment: string;

  @Column({ type: 'uuid', nullable: false })
  project_id: string
}
