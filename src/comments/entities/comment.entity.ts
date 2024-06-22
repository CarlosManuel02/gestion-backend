import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('task_comments')
export class TaskComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  task_id: string;

  @Column('uuid')
  user_id: string;

  @Column('text')
  comment: string;

  @Column('uuid')
  replay_to: string;


  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
