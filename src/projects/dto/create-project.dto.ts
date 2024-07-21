import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray, IsBoolean,
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
  @IsOptional()
  members: any[];

  @IsBoolean()
  @IsNotEmpty()
  visibility: boolean;

  @IsString()
  @IsNotEmpty()
  project_key: string;

  @IsString()
  @IsOptional()
  repository_url: string;
}
