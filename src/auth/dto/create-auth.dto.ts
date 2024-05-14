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


  @IsString()
  @IsOptional()
  salt?: string;
}
