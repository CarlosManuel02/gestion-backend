import {IsUUID, IsString, IsNotEmpty, IsOptional} from 'class-validator';

export class CreateAttachmentDto {

  @IsUUID()
  @IsOptional()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  task_id: string;
}
