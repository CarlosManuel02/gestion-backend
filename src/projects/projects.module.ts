import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Image } from './entities/image.entity';
import { ProjectMenbers } from './entities/projectMenbers.entity';
import { AuthModule } from '../auth/auth.module';
import {NotificationsService} from "../notifications/notifications.service";
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TypeOrmModule.forFeature([Project, Image, ProjectMenbers]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}
