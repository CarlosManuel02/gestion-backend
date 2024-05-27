import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'logs' })
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', {})
  user_id: string;

  @Column('varchar', {
    nullable: false,
  })
  action: string;

  @Column('timestamp', {})
  created_at: Date;
}
