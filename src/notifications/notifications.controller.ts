import {Body, Controller, Get, Param, Post, Sse} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { map, Observable } from 'rxjs';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('all/:id')
  getAllNotifications(@Param('id') id: string) {
    return this.notificationsService.getAllNotifications(id);
  }

  @Post('read/:id')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Sse('notify')
  sseNotification(): Observable<{ data: Notification }> {
    return this.notificationsService.getNotifications().pipe(
      map((notification: Notification) => ({
        data: notification,
      })),
    );
  }
}
