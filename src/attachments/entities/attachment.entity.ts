import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  task_id: string;

  @Column({ type: 'varchar', nullable: false })
  file_name: string;

  @Column({ type: 'bytea', nullable: false })
  data: Buffer;

  @Column({ type: 'varchar', nullable: false })
  mime_type: string;
}
