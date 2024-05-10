import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity({
  name: 'Users',
})
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

  @Column('varchar', {
    nullable: false,
  })
  role: string;

  @Column('timestamp', {
    nullable: true,
  })
  lastLogin: Date;

  @Column('varchar', {
    nullable: false,
  })
  salt: string;

  @Column('varchar', {
    nullable: true,
  })
  resetPasswordToken: string;

  @Column('timestamp', {
    nullable: true,
  })
  resetPasswordExpires: Date;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
