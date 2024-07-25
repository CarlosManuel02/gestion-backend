import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LogDto } from './dto/log.dto';
import { v4 as uuidv4, validate as isUUID } from 'uuid';


@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async findAll(): Promise<Log[]> {
    return this.logRepository.find();
  }

  // async findOne(id: number): Promise<Log> {
  //   return this.logRepository.findOne(id);
  // }

  async create(id: string, action: string): Promise<Log> {
    const newLog = new Log();
    newLog.id = uuidv4();
    newLog.user_id = id;
    newLog.action = action;
    newLog.created_at = new Date();
    try {
      const log = this.logRepository.create(newLog);
      await this.logRepository.save(log);
      console.log('Log created', log);
      return log;
    } catch (error) {
      console.log('Error creating log', error);
      return error;
    }
  }
}
