import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Attachment} from "./entities/attachment.entity";
import {TasksModule} from "../tasks/tasks.module";

@Module({
  imports: [
    TasksModule,
    TypeOrmModule.forFeature([Attachment]),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
})
export class AttachmentsModule {}
