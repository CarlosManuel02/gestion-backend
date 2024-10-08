import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { SettingsDto } from './dto/settings.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  create(@Body() createProjectDto: CreateProjectDto) {
    console.log('createProjectDto', createProjectDto);
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

  @Patch('members/updateMember')
  updateMember(@Body() addMemberDto: AddMemberDto) {
    return this.projectsService.updateMember(addMemberDto);
  }

  @Get('public')
  getPublicProjects() {
    return this.projectsService.getPublicProjects();
  }

  @Delete('removeMember')
  removeMember(@Body() addMemberDto: AddMemberDto) {
    return this.projectsService.removeMember(addMemberDto);
  }

  @Post('members/check/')
  checkMember(@Body() addMemberDto: AddMemberDto) {
    return this.projectsService.checkMember(addMemberDto);
  }

  @Get('tasks/:projectId')
  getProjetTasks(@Param('projectId') projectId: string) {
    return this.projectsService.getProjetTasks(projectId);
  }

  @Get('all/:userID')
  findAll(@Param('userID') userID: string, @Query('search') search?: string) {
    return this.projectsService.findAll(userID, search);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.projectsService.findOne(term);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Get(':id/settings')
  getProjectSettings(@Param('id') id: string) {
    return this.projectsService.getProjectSettings(id);
  }

  @Patch(':id/settings')
  updateProjectSettings(
    @Param('id') id: string,
    @Body() updateProjectDto: SettingsDto,
  ) {
    return this.projectsService.updateProjectSettings(id, updateProjectDto);
  }
}
