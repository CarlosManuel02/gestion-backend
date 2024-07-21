import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsUUID, IsEmail,
} from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  @IsOptional()
  task_id?: string;

  @IsString()
  @IsNotEmpty()
  task_key: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  @IsNotEmpty()
  creation_date: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsInt()
  @IsNotEmpty()
  priority: number;

  @IsOptional()
  @IsEmail()
  assignment?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;
}
