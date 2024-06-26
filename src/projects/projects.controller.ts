import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Post('addMember')
  addMember(@Body() addMemberDto: AddMemberDto) {
    return this.projectsService.addMember(addMemberDto);
  }

  @Get('members/:projectId')
  getProjectMembers(@Param('projectId') projectId: string) {
    return this.projectsService.getProjectMembers(projectId);
  }

  @Get('tasks/:projectId')
  getProjetTasks(@Param('projectId') projectId: string) {
    return this.projectsService.getProjetTasks(projectId);
  }

  @Get('all/:term')
  findAll(@Param('term') term: string) {
    return this.projectsService.findAll(term);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.projectsService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
