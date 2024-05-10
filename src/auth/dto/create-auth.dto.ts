import {
  IsDate,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength
} from "class-validator";

export class CreateAuthDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  id?: string;

  @IsString()
  @MinLength(4)
  @IsOptional()
  username?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsIn(['admin', 'user'])
  @IsOptional()
  role?: string;

  @IsOptional()
  @IsDate()
  lastLogin?: Date;

  @IsString()
  @IsOptional()
  salt?: string;
}
