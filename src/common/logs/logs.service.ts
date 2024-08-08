import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LogDto } from './dto/log.dto';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
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
      return log;
    } catch (error) {
      return error;
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async deleteLogs(): Promise<void> {
    const logs = await this.logRepository.find();
    for (const log of logs) {
      if (isUUID(log.id)) {
        await this.logRepository.delete(log.id);
      }
    }
  }
}
