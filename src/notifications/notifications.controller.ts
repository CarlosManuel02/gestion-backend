import { Controller, Sse } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { map, Observable } from 'rxjs';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('notify')
  sseNotification(): Observable<{ data: Notification }> {
    return this.notificationsService.getNotifications().pipe(
      map((notification: Notification) => ({
        data: notification,
      })),
    );
  }
}
