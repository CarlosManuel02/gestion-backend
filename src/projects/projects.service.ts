import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';

import { v4 as uuidv4 } from 'uuid';
import { ProjectMenbers } from './entities/projectMenbers.entity';
import { isUUID } from 'class-validator';
import { AddMemberDto } from './dto/add-member.dto';
import { AuthService } from '../auth/auth.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProjectsService {
  constructor(
    // Inject the ProjectRepository
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(ProjectMenbers)
    private projectMenbersRepository: Repository<ProjectMenbers>,
    private auth: AuthService,
    private notificationService: NotificationsService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const image = this.imageRepository.create({
      url: createProjectDto.image_url,
    });
    await this.imageRepository.save(image);
    createProjectDto.id = uuidv4();
    createProjectDto.start_date = new Date();
    createProjectDto.end_date = new Date();
    createProjectDto.image_url = image.image_id;
    const { admins, members } = await this.getAdmins(createProjectDto);
    createProjectDto.members = [...admins, ...members];
    const project = this.projectRepository.create({
      image_id: image,
      ...createProjectDto,
    });
    try {
      await this.projectRepository.save(project).then(async () => {
        await this.notifyMembers(members, project);
        return await this.validateUser(createProjectDto, project);
      });
    } catch (error) {
      return error;
    }
    return project;
  }

  private async notifyMembers(members: any[], project: Project) {
    for (const member of members) {
      await this.notificationService.create({
        from_user: project.owner,
        to_user: member.user,
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

    return project;
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
}
