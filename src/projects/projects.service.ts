import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';

import { v4 as uuidv4 } from 'uuid';
import { ProjectMenbers } from './entities/projectMenbers.entity';
import { isUUID } from 'class-validator';

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
    const project = this.projectRepository.create({
      image_id: image,
      ...createProjectDto,
    });
    console.log(createProjectDto);
    try {
      await this.projectRepository.save(project).then(() => {
        if (createProjectDto.members) {
          createProjectDto.members.forEach((member) => {
            this.addMemberToProject(project, member);
            console.log(member);
          });
        }
      });
    } catch (error) {
      console.log(error);
      return error;
    }
    return project;
  }

  findAll() {
    return `This action returns all projects`;
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
      throw new NotFoundException(`Project with term ${term} not found`)
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
    project: Project,
    member: { id: string; role: string },
  ) {
    const projectMenber = this.projectMenbersRepository.create({
      project_id: project.id,
      user_id: member.id,
      role: member.role,
    });
    await this.projectMenbersRepository.save(projectMenber).then((res) => {
      console.log(res);
    });
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
}
