import {IsArray, IsBoolean, IsOptional, IsString, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';

class PermissionDto {
  @IsString()
  permission: string;

  @IsBoolean()
  value: boolean;
}

export class SettingsDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  project_id: string;

  @IsString()
  role_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
