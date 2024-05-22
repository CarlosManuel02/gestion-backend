import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Image } from './image.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'uuid', nullable: false })
  owner: string;

  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({ name: 'image' })
  image_id: Image;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: false })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: string;
}
