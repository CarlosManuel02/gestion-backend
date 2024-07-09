import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateProjectDto {

  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @IsOptional()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  // @IsString()
  // @IsNotEmpty()
  // status: string;

  // @IsArray()
  @IsNotEmpty()
  members: any[];

  // @IsString()
  // @IsNotEmpty()
  // owner: string;

  @IsString()
  @IsNotEmpty()
  project_key: string;

  @IsString()
  @IsOptional()
  repository_url: string;
}
