import {IsUUID, IsString, IsNotEmpty, IsOptional} from 'class-validator';

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

  @IsString()
  @IsOptional()
  replay_to?: string;

}
