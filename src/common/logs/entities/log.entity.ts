import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'Logs',
})
export class Log {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false,
  })
  user_id: string;

  @Column('varchar', {
    nullable: false,
  })
  action: string;

  @Column('timestamp', {
    nullable: true,
  })
  createdAt: Date;
}