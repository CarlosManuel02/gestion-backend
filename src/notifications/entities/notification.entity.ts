import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('uuid')
  from_user: string;

  @Column('uuid')
  to_user: string;

  @Column('text')
  message: string;

  @Column('timestamp')
  created_at: Date;

  @Column('boolean')
  read: boolean;
}
