import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsUUID,
  IsEmail,
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
  @IsOptional()
  status: string;

  @IsDateString()
  @IsOptional()
  creation_date: string;

  @IsNotEmpty()
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
