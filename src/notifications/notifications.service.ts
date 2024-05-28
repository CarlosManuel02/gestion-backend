import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Subject } from 'rxjs';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  private notifications$ = new Subject<Notification>();

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    createNotificationDto.id = uuidv4();
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );

    await this.notificationRepository.save(notification);
    this.addNotification(notification);
    return notification;
  }

  async save(notification: Notification): Promise<Notification> {
    notification.id = uuidv4();
    const savedNotification =
      await this.notificationRepository.save(notification);
    this.addNotification(savedNotification);
    return savedNotification;
  }

  addNotification(notification: Notification) {
    this.notifications$.next(notification);
  }

  getNotifications() {
    return this.notifications$.asObservable();
  }
}
