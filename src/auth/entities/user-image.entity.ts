import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_image')
export class UserImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'bytea', nullable: false })
  data: Buffer;

  @Column({ type: 'varchar', nullable: false })
  mime_type: string;
}
