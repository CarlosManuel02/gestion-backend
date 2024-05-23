import { Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import {Attachment} from "./entities/attachment.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class AttachmentsService {

  constructor(
    // Inject the attachment repository
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>
  ) {
  }
  create(createAttachmentDto: CreateAttachmentDto) {
    return createAttachmentDto
  }

  findAll() {
    return `This action returns all attachments`;
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
