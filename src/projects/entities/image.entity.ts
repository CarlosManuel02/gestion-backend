import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  image_id: string;

  @Column('uuid')
  project_id: string;

  @Column('bytea')
  data: Buffer;

  @Column('text')
  mime_type: string;
}
