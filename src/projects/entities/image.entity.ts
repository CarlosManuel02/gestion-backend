import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  image_id: string;

  @Column({ type: 'text', nullable: false })
  url: string;
}
