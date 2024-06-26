import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { v4 as uuidv4 } from 'uuid';
import { ProjectMenbers } from './entities/projectMenbers.entity';
import { isUUID } from 'class-validator';
import { AddMemberDto } from './dto/add-member.dto';
import { AuthService } from '../auth/auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectRepo } from './entities/projectRepo.entity';

@Injectable()
export class ProjectsService {
  constructor(
    // Inject the ProjectRepository
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMenbers)
    private projectMenbersRepository: Repository<ProjectMenbers>,
    @InjectRepository(ProjectRepo)
    private projectRepoRepository: Repository<ProjectRepo>,
    private auth: AuthService,
    private notificationService: NotificationsService,
  ) {}

  async create(createProjectDto: CreateProjectDto){
    // from String[] to json[]
    createProjectDto.members = JSON.parse(createProjectDto.members.toString());

    createProjectDto.id = uuidv4();
    createProjectDto.start_date = new Date();
    createProjectDto.end_date = new Date();
    const { admins, members } = await this.getAdmins(createProjectDto);
    createProjectDto.members = [...admins, ...members];
    const project = this.projectRepository.create({
      id: createProjectDto.id,
      name: createProjectDto.name,
      description: createProjectDto.description,
      start_date: createProjectDto.start_date,
      end_date: createProjectDto.end_date,
      owner: createProjectDto.owner,
      project_key: createProjectDto.project_key,
      status: createProjectDto.status,
    });
    try {
      await this.projectRepository.save(project).then(async () => {
        await this.validateUser(createProjectDto, project);
        await this.notifyMembers([...admins, ...members], project);
        if (createProjectDto.repository_url) {
          await this.saveProjectRepo(project, createProjectDto.repository_url);
        }
        // console.log(img);
      });
    } catch (error) {
      return error;
    }
    return project;
  }

  private async notifyMembers(members: any[], project: Project) {
    for (const member of members) {
      console.log(member);
      await this.notificationService.create({
        title: `Project ${project.name}`,
        from_user: project.owner,
        to_user: member.id,
        message: `You have been added to project ${project.name}`,
        created_at: project.start_date,
      });
    }
  }

  private async validateUser(
    createProjectDto: CreateProjectDto,
    project: Project,
  ) {
    if (createProjectDto.members) {
      for (const member of createProjectDto.members) {
        const user = await this.checkUserExists(member.id);
        if (!user) {
          return {
            message: `User with id ${member.id} not found`,
          };
        }
        await this.addMemberToProject(project.id, member);
      }
    }
  }

  async findAll(term: string) {
    try {
      const projects = await this.projectRepository.query(
        `SELECT *
         FROM get_all_projects_from_user('${term}')`,
      );
      return projects;
    } catch (error) {
      throw new NotFoundException('No projects found');
    }
  }

  private async saveProjectRepo(project: Project, repo: string) {
    const projectRepo = this.projectRepoRepository.create({
      id: uuidv4(),
      project_id: project.id,
      url: repo,
    });
    try {
      await this.projectRepoRepository.save(projectRepo).then((res) => {
        return {
          message: `Repo ${repo} added to project with id ${project.id}`,
          res,
        };
      });
    } catch (error) {
      return error;
    }
  }

  async findOne(term: string) {
    let project: Project;
    try {
      if (isUUID(term)) {
        project = await this.getProjectDetails(term, true);
      } else {
        project = await this.getProjectDetails(term, false);
      }

      if (!project) {
        return {
          message: `Project with term ${term} not found`,
        };
      }
    } catch (e) {
      throw new NotFoundException(`Project with term ${term} not found`);
    }

    return {
      status: 200,
      data: project,
    };
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async addMemberToProject(
    project_id: string,
    member: { id: string; role: string },
  ) {
    const memberExists = await this.projectMenbersRepository.findOne({
      where: { project_id: project_id, user_id: member.id },
    });
    if (memberExists) {
      return {
        message: `User with id ${member.id} already exists in project with id ${project_id}`,
      };
    }

    const projectMember = this.projectMenbersRepository.create({
      id: uuidv4(),
      project_id: project_id,
      user_id: member.id,
      role: member.role,
    });
    try {
      await this.projectMenbersRepository.save(projectMember).then((res) => {
        return {
          message: `User with id ${member.id} added to project with id ${project_id}`,
          res,
        };
      });

      return {
        message: `User with id ${member.id} added to project with id ${project_id}`,
        projectMember,
      };
    } catch (error) {
      return error;
    }
  }

  private async getProjectDetails(term: string, isUUID: boolean) {
    if (isUUID) {
      return await this.projectRepository.query(`SELECT *
                                                 FROM get_project_details('${term}', NULL)`);
    } else {
      return await this.projectRepository.query(`SELECT *
                                                 FROM get_project_details(NULL, '${term}')`);
    }
  }

  addMember(addMemberDto: AddMemberDto) {
    return this.addMemberToProject(addMemberDto.project_id, addMemberDto);
  }

  checkUserExists(user_id: string) {
    return this.auth.findBy(user_id);
  }

  async getAdmins(createProjectDto: CreateProjectDto) {
    const members = [];
    const admins = [];
    if (createProjectDto.members) {
      for (const member of createProjectDto.members) {
        if (member.role === 'member') {
          members.push(member);
        } else {
          admins.push(member);
        }
      }
    }
    return { admins, members };
  }

  async getProjectMembers(projectId: string) {
    const project = await this.projectMenbersRepository.find({
      where: { project_id: projectId },
    });
    if (!project) {
      return {
        message: `Project with id ${projectId} not found`,
      };
    }

    try {
      const projectMembers = await this.projectMenbersRepository.query(`SELECT *
                                                                        FROM get_all_project_members('${projectId}')`);
      return {
        data: projectMembers,
        status: 200,
      };
    } catch (error) {
      return error;
    }
  }

  getProjetTasks(projectId: string) {
    const tasks = this.projectRepository.query(`SELECT * FROM get_all_tasks_from_project('${projectId}')`);
    return tasks;
  }
}
