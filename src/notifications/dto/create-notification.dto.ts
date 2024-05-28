import { IsUUID, IsString, IsDate, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  title: string;

  @IsUUID()
  from_user: string;

  @IsUUID()
  to_user: string;

  @IsString()
  message: string;

  @IsDate()
  created_at: Date;
}
