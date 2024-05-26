import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Aquí se define el nombre del campo del formulario que contiene el archivo
  create(
    @UploadedFile() file,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ) {
    return this.attachmentsService.create(file, createAttachmentDto);
  }
  @Get(':taskId')
  findAll(@Param('taskId') taskId: string) {
    return this.attachmentsService.findAll(taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ) {
    return this.attachmentsService.update(id, updateAttachmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
