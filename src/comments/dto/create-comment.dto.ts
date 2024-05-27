import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  task_id: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
