import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, Sse,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('new')
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get('all/:task_id')
  findAll(@Param('task_id') task_id: string) {
    return this.commentsService.findAll(task_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
