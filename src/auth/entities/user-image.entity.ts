import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_image')
export class UserImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @Column({ type: 'varchar' })
  mime_type: string;
}
