import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsArray,
} from 'class-validator';
import {Image} from "../entities/image.entity";

export class CreateProjectDto {

  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @IsOptional()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsArray()
  @IsNotEmpty()
  members: {id: string, role: string}[];

  @IsString()
  @IsNotEmpty()
  owner: string;
}
