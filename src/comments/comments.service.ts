import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskComment } from './entities/comment.entity';
import {AuthService} from "../auth/auth.service";
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private commentRepository: Repository<TaskComment>,
    private authService: AuthService,
  ) {}
  async create(createCommentDto: CreateCommentDto) {

    const comment = new TaskComment();
    comment.id = uuidv4();
    comment.comment = createCommentDto.comment;
    comment.replay_to = createCommentDto.replay_to || null;
    comment.task_id = createCommentDto.task_id;
    comment.user_id = createCommentDto.user_id;
    comment.created_at = new Date();

    return await this.commentRepository.save(comment);

  }

  findAll(task_id: string) {

    return this.commentRepository.query(`SELECT * FROM get_all_commets_from_user('${task_id}')`);


  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
