import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectsService {
  constructor(
    // Inject the ProjectRepository
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
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
      await this.projectRepository.save(project);
      createProjectDto.members.forEach((member) => {
        this.projectRepository.query(
          `Insert into ProjectMembers (project_id, user_id) values ('${project.id}', '${member}')`,
        );
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

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
