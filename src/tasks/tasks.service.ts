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
    const { user } = await this.authService.findBy(createTaskDto.assignment);
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
    try {
      createTaskDto.creation_date = new Date().toISOString();
      createTaskDto.assignment = user.id;
      createTaskDto.task_id = uuidv4();
      createTaskDto.status = 'open';
      const task = this.taskRepository.create(createTaskDto);
      await this.taskRepository.save(task);

      return {
        status: 201,
        task,
        message: 'Task created',
      };
    } catch (error) {
      return {
        status: 500,
        error,
        message: 'Error creating task',
      };
    }
  }

  async findAllFromUser(term: string) {
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

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    let task = await this.taskRepository.findOne({
      where: {task_id: id},
    });
    if (!task.task_id) {
      return {
        status: 500,
        message: 'Error deleting the task',
      };
    }

    try {
      task = await this.taskRepository.preload({
        task_id: id,
        ...updateTaskDto,
      });
      const {user} = await this.authService.findBy(task.assignment);
      task.assignment = user.id;
      await this.taskRepository.save(task);
      return {
        status: 200,
        task: task,
      };
    } catch (error) {
      return {
        status: 500,
        error,
        message: 'Error updating task',
      };
    }
  }

  async remove(id: string) {
    const task = await this.taskRepository.findOne({
      where: {task_id: id},
    });
    if (!task) {
      return {
        status: 500,
        message: 'Error deleting the task',
      };
    }
    try {
      await this.taskRepository.delete(id);
      return {
        status: 200,
        message: 'Task Deleted',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting task',
      };
    }
  }

  async findAllFromProject(term: string) {
    try {
      if (isUUID(term)) {
        const tasks = await this.taskRepository.query(
          `SELECT *
           FROM get_all_tasks_from_project('${term}')`,
        );
        return {
          tasks,
          status: 200,
        };
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
}
