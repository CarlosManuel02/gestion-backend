import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/auth.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogsService } from '../common/logs/logs.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly authRepository: Repository<User>,
    private readonly datasource: DataSource,
    private readonly jwtService: JwtService,
    public readonly logService: LogsService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    createAuthDto.id = uuidv4();

    createAuthDto.role = 'user';

    const user = await this.findBy(createAuthDto.email);
    if (user) {
      return {
        message: 'The email is already in use',
      };
    }

    try {
      createAuthDto.salt = await bcrypt.genSalt(10);
      createAuthDto.password = await bcrypt.hash(
        createAuthDto.password,
        createAuthDto.salt,
      );

      const token = await this.generateJWT(createAuthDto);

      const auth = this.authRepository.create(createAuthDto);
      await this.authRepository.save(auth).then(async (user) => {
        await this.logService.create(user.id, 'User created');
      });
      return {
        user: auth.id,
        token,
        status: 200,
      };
    } catch (e) {
      return {
        message: 'Error while creating the user',
        e,
      };
    }
  }

  // private async createLog(user: User) {
  // const log = new LoginLog();
  // log.id = uuidv4();
  // log.userId = user.id;
  // log.loginAt = new Date();
  // log.ip = '';
  // await this.logService.createLog(log);
  // }

  findAll(Pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = Pagination;

    return this.authRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async findBy(term: string) {
    let user: User;
    try {
      if (isUUID(term)) {
        user = await this.authRepository.findOneBy([
          {
            id: term,
          },
          {
            resetPasswordToken: term,
          },
        ]);
      } else {
        const queryBuilder = this.authRepository.createQueryBuilder('user');
        user = await queryBuilder
          .where('email = :email OR username = :username', {
            email: term,
            username: term,
          })
          .getOne();
      }
      if (!user) {
        return null;
      }
    } catch (e) {
      throw new BadRequestException('No user found with the given term');
    }
    return user;
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    const user = await this.authRepository.preload({
      id: id,
      ...updateAuthDto,
    });

    if (!user) throw new NotFoundException('User not found');

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await queryRunner.manager.save(user);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    return user;
  }

  async remove(id: string) {
    const auth = await this.findBy(id);

    if (!auth) {
      return {
        message: 'Usuario no encontrado',
      };
    }
    try {
      const result = await this.authRepository.delete(id);
      return {
        message: 'User deleted successfully',
        result,
      };
    } catch (e) {
      return {
        message: 'Error while deleting the user',
        e,
      };
    }
  }

  async login(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const user = await this.findBy(email);

    if (user && (await user.validatePassword(password))) {
      const token = await this.generateJWT(user);
      await this.authRepository.save(user).then(async (user) => {
        await this.logService.create(user.id, 'User logged in');
      });
      // await this.createLog(user);
      return {
        user: user,
        token,
        status: 200,
      };
    } else {
      return {
        message: 'Incorrect email or password',
      };
    }
  }

  async renewToken(token: string) {
    console.log(token);
    const payload = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.findBy(payload.email);
    if (!user) throw new NotFoundException('User not found');
    const newToken = await this.generateJWT(user);
    return {
      user: user,
      token: newToken,
      status: 200,
    };
  }

  async generateJWT(createAuthDto: CreateAuthDto | User) {
    const payload = {
      username: createAuthDto.username,
      email: createAuthDto.email,
      role: createAuthDto.role,
    };
    return this.jwtService.sign(payload);
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPasswordDto) {
    const { email } = requestResetPasswordDto;

    const user = await this.findBy(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    user.resetPasswordToken = this.genetareCode();
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.authRepository.save(user);

    this.sendEmail(user, 'resetPassword');

    return {
      status: 200,
    };
  }

  async verifyCode(token: string) {
    const user = await this.authRepository.findOneBy({
      resetPasswordToken: token,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.resetPasswordExpires < new Date()) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.authRepository.save(user);
      throw new UnauthorizedException('Token expired');
    }
    return {
      message: 'Token verified',
      status: 200,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { id, password, code } = resetPasswordDto;

    const user = await this.authRepository.findOneBy({
      id,
      resetPasswordToken: code,
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    user.salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, user.salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.authRepository.save(user);
    return {
      status: 200,
    };
  }

  private sendEmail(user: User, subjet: string) {
    //TODO: Implement email service
    console.log(`CODE: ${user.resetPasswordToken}`);
  }

  private genetareCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
