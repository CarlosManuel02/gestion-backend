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

  async getAllNotifications(id: string) {
    try {
      const notifications = await this.notificationRepository.query(
        `SELECT * FROM get_all_notifications_from_user('${id}')`,
      );
      return {
        notifications,
        count: notifications.length,
        status: 200,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        message: error,
      };
    }
  }

  async markAsRead(id: string) {
    let notification: Notification;

    try {
      notification = await this.notificationRepository.findOne({
        where: { id },
      });
      if (notification) {
        notification.read = true;
        await this.notificationRepository.save(notification);
        return {
          status: 200,
          message: 'Notification marked as read',
        };
      } else {
        return {
          status: 404,
          message: 'Notification not found',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        message: error,
      };
    }
  }
}
