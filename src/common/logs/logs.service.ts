import { Injectable } from '@nestjs/common';
import { Repository } from "typeorm";
import { Log } from "./entities/log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { LogDto } from "./dto/log.dto";

@Injectable()
export class LogsService {

  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {
  }


  async findAll(): Promise<Log[]> {
    return this.logRepository.find();
  }

  // async findOne(id: number): Promise<Log> {
  //   return this.logRepository.findOne(id);
  // }

  async create(id: string, action: string): Promise<Log> {

    const newLog = new Log();
    newLog.user_id = id
    newLog.action = action
    newLog.createdAt = new Date();
    return this.logRepository.save(newLog);

  }

}
