import {Injectable} from '@nestjs/common';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';
import {Task} from './entities/task.entity';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {AuthService} from '../auth/auth.service';
import {ProjectsService} from '../projects/projects.service';
import {v4 as uuidv4, validate as isUUID} from 'uuid';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private projectService: ProjectsService,
    private authService: AuthService,
  ) {
  }

  async create(createTaskDto: CreateTaskDto) {
    const user = await this.authService.findBy(createTaskDto.assignment);
    if (!user) {
      return {
        message: 'The user does not exist',
      };
    }
    const project = await this.projectService.findOne(createTaskDto.project_id);
    if (!project) {
      return {
        message: 'The project does not exist',
      };
    }
    createTaskDto.creation_date = new Date().toISOString();
    createTaskDto.assignment = user.id;
    const task = this.taskRepository.create(createTaskDto);
    return this.taskRepository.save(task);
  }

  async findAll(term: string) {
    try {
      if (isUUID(term)) {
        const tasks = await this.taskRepository.query(
          `SELECT *
           FROM get_all_tasks_from_user('${term}', null)`,
        );
        return tasks;
      } else {
        const tasks = await this.taskRepository.query(
          `SELECT *
           FROM get_all_tasks_from_user(null, '${term}')`,
        );
        return {
          tasks,
          status: 200,
        };
      }
    } catch (error) {
      return error;
    }
  }

  async findOne(term: string) {
    let task: Task;
    try {
      if (isUUID(term)) {
        task = await this.taskRepository.query(
          `SELECT *
           FROM get_task_details('${term}')`,
        );
      } else {
      }

      if (!task) {
        return {
          message: 'Task not found',
        };
      }
    } catch (error) {
      return error;
    }
    return {
      task,
      status: 200,
    };
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
