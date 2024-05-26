import { Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { Attachment } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksService } from '../tasks/tasks.service';
import { isUUID } from 'class-validator';

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
      status: 200,
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
    const attachments = await this.attachmentRepository.find({
      where: { task_id: taskId },
    });
    return {
      status: 200,
      attachments: attachments,
    };
  }

  async findOne(id: string) {
    let attachment: Attachment;
    if (isUUID(id)) {
      attachment = await this.attachmentRepository.findOne({
        where: { id: id },
      });
    } else {
      attachment = await this.attachmentRepository.findOne({
        where: { file_name: id },
      });
    }
    if (!attachment) {
      return {
        message: 'Attachment not found',
      };
    }
    return {
      status: 200,
      attachment: attachment,
    };
  }

  async update(id: string, updateAttachmentDto: UpdateAttachmentDto) {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: id },
    });
    if (!attachment) {
      return {
        message: 'Attachment not found',
      };
    }
    try {
      const updatedAttachment = await this.attachmentRepository.preload({
        id: attachment.id,
        ...updateAttachmentDto,
      });
      await this.attachmentRepository.save(updatedAttachment);
      return {
        status: 200,
        attachment: updatedAttachment,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error updating attachment',
      };
    }
  }

  async remove(id: string) {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: id },
    });
    if (!attachment) {
      return {
        message: 'Attachment not found',
      };
    }
    try {
      await this.attachmentRepository.delete(id);
      return {
        status: 200,
        message: 'Attachment deleted',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting attachment',
      };
    }
  }
}
