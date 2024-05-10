import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}