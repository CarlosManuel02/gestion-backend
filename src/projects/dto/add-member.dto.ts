import {IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  project_id: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  role: string;
}
