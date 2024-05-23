import {IsUUID, IsString, IsNotEmpty, IsBase64, IsOptional} from 'class-validator';

export class CreateAttachmentDto {

  @IsUUID()
  @IsOptional()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  task_id: string;

  @IsString()
  @IsNotEmpty()
  file_name: string;

  @IsBase64()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  mime_type: string;
}
