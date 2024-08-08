import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false,
  })
  username: string;

  @Column('varchar', {
    nullable: false,
  })
  email: string;

  @Column('varchar', {
    nullable: false,
  })
  password: string;

  @Column('timestamp', {
    nullable: false,
  })
  created_at: Date;

  @Column('varchar', {
    nullable: false,
  })
  salt: string;

  @Column('varchar', {
    nullable: true,
  })
  reset_password_token: string;

  @Column('timestamp', {
    nullable: true,
  })
  reset_password_expires: Date;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
