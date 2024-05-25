import { Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { Attachment } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class AttachmentsService {
  constructor(
    // Inject the attachment repository
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    private tasksService: TasksService,
  ) {}
  async create(file, createAttachmentDto: CreateAttachmentDto) {
    const attachment = this.attachmentRepository.create({
      task_id: createAttachmentDto.task_id,
      file_name: file.originalname,
      mime_type: file.mimetype,
      data: file.buffer,
    });

    await this.attachmentRepository.save(attachment);
    return {
      message: 'This action adds a new attachment',
      attachment: attachment,
    };
  }

  async findAll(taskId: string) {
    const task = this.tasksService.findOne(taskId);
    if (!task) {
      return {
        message: 'Task not found',
      };
    }
    return await this.attachmentRepository.find({
      where: { task_id: taskId },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} attachment`;
  }

  update(id: number, updateAttachmentDto: UpdateAttachmentDto) {
    return `This action updates a #${id} attachment`;
  }

  remove(id: number) {
    return `This action removes a #${id} attachment`;
  }
}
